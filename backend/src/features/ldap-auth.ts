import jwt from 'jsonwebtoken';
import * as ldap from 'ldapjs';
import { ServerResponse } from 'http';
import { config } from 'dotenv';
import { Pool } from 'mariadb';
import * as dbSelect from '../shared/db/db_select';

config();

export async function checkUserCredentials(reqBody: string, res: ServerResponse, dbPool: Pool): Promise<any> {
  let employeeIdByEmail: any;
  const ldapClient = ldap.createClient({
    url: process.env.LDAP_URL as string,
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    // 'Access-Control-Max-Age': 2592000, // 30 days
  };

  const { email, password } = JSON.parse(reqBody);
  if (!reqBody || !email || !password) {
    res.statusCode = 400;
    res.statusMessage = JSON.stringify({ Error: true, Message: 'Bad Request: empty data' });
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.end();
  }

  await dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getEmployeeByEmail(JSON.parse(reqBody).email)).then(rows => {
        rows.forEach((row: any) => {
          employeeIdByEmail = row.id;
        });
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });

  ldapClient.bind(email, password, (err: any) => {
    if (err) {
      ldapClient.unbind();
      res.statusCode = 400;
      res.statusMessage = JSON.stringify({ Error: true, Message: 'Wrong email/password combination' });
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      res.end();
    } else {
      const filter = `(userPrincipalName=${email})`;

      ldapClient.search(process.env.AD_SUFFIX as string, { filter, scope: 'sub' }, (ldapSearchErr: any, ldapSearchRes: any) => {
        // assert.ifError(errr);
        ldapSearchRes.on('searchEntry', (entry: any) => {
          // Sign JWT and send it to Client
          const userToken = jwt.sign({ email }, process.env.JWT_SECRET as string, {
            expiresIn: '1h',
            subject: 'IT-Support-Portal',
          });
          res.statusCode = 200;
          Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
          res.end(
            JSON.stringify({
              id: employeeIdByEmail,
              email,
              userDisplayName: entry.object.displayName,
              userPhoto: entry.raw.thumbnailPhoto ? entry.raw.thumbnailPhoto.toString('base64') : null,
              token: userToken,
            }),
          );
        });
        // res.on('searchReference', referral => {
        //   console.log(`referral: ${referral.uris.join()}`);
        // });
        // ldapSearchRes.on('error', err => {
        //  console.error(`error: ${err.message}`);
        // });
        ldapSearchRes.on('end', (result: any) => {
          console.log(`status: ${result.status}`);
        });
      });

      console.log('binding success');
    }
  });
}
