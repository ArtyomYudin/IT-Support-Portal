import jwt from 'jsonwebtoken';
import * as ldap from 'ldapjs';
import { ServerResponse } from 'node:http';
import { Pool } from 'mariadb';

import { Blob } from 'node:buffer';
import * as dbSelect from '../shared/db/db_select';
import { logger } from './logger';

export async function checkUserCredentials(reqBody: string, res: ServerResponse, dbPool: Pool): Promise<any> {
  let employeeIdByUPN: any;
  const ldapClient = ldap.createClient({
    url: process.env.LDAP_URL as string,
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    // 'Access-Control-Max-Age': 2592000, // 30 days
  };

  const { userPrincipalName, password } = JSON.parse(reqBody);
  if (!reqBody || !userPrincipalName || !password) {
    res.statusCode = 400;
    res.statusMessage = JSON.stringify({ Error: true, Message: 'Bad Request: empty data' });
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.end();
  }

  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getEmployeeByUPN(JSON.parse(reqBody).userPrincipalName));
    rows.forEach((row: any) => {
      employeeIdByUPN = row;
    });
  } catch (error) {
    logger.error(`LDAP - ${error}`);
  } finally {
    if (conn) conn.release();
  }

  if (employeeIdByUPN) {
    ldapClient.bind(userPrincipalName, password, (err: any) => {
      if (err) {
        ldapClient.unbind();
        res.statusCode = 400;
        res.statusMessage = JSON.stringify({ Error: true, Message: 'Wrong user/password combination' });
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.end();
      } else {
        const filter = `(userPrincipalName=${userPrincipalName})`;

        ldapClient.search(process.env.AD_SUFFIX as string, { filter, scope: 'sub' }, (ldapSearchErr: any, ldapSearchRes: any) => {
          // assert.ifError(errr);
          ldapSearchRes.on('searchEntry', (entry: any) => {
            // Sign JWT and send it to Client
            const userToken = jwt.sign({ userPrincipalName }, process.env.JWT_SECRET as string, {
              expiresIn: '8h',
              subject: 'IT-Support-Portal',
            });
            res.statusCode = 200;
            Object.entries(headers).forEach(([key, value]) => {
              res.setHeader(key, value);
            });
            res.end(
              JSON.stringify({
                id: userPrincipalName,
                // email,
                userDisplayName: employeeIdByUPN.displayName,
                userPhoto: employeeIdByUPN.thumbnailPhoto ? Buffer.from(employeeIdByUPN.thumbnailPhoto).toString('base64') : null,
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
            logger.info(`LDAP - status: ${result.status}`);
          });
        });

        logger.info('LDAP - binding success');
        /*
        ldapClient.search(
          'OU=HQ,DC=center-inform,DC=ru',
          {
            filter: '(objectClass=user)',
            attributes: [
              'sAMAccountName',
              'userPrincipalName',
              'name',
              'givenName',
              'distinguishedName',
              'displayName',
              'cn',
              'sn',
              'mail',
              'title',
              'description',
              'department',
              'company',
              'manager',
              'telephoneNumber',
              'thumbnailPhoto',
            ],
            scope: 'sub',
          },
          (ldapSearchErr: any, ldapSearchRes: any) => {
            ldapSearchRes.on('searchEntry', (entry: any) => {
              if (entry.object.userPrincipalName) {
                dbPool
                  .getConnection()
                  .then(conn => {
                    conn.query(
                      `INSERT INTO employee (user_principal_name, display_name, department_id, position_id, call_number) VALUES ('${
                        entry.object.userPrincipalName
                      }', '${entry.object.displayName}', 0,0, ${entry.object.telephoneNumber || null}) ON DUPLICATE KEY UPDATE    
                      display_name = '${entry.object.displayName}'`,
                    );
                    if (entry.object.mail) {
                      conn.query(
                        `INSERT INTO employee_mail (user_principal_name, mail) 
                        VALUES ('${entry.object.userPrincipalName}', '${entry.object.mail}') 
                        ON DUPLICATE KEY UPDATE    
                        mail = '${entry.object.mail}'`,
                      );
                    }
                    if (entry.raw.thumbnailPhoto) {
                      conn.query(
                        'INSERT INTO employee_photo (user_principal_name, thumbnail_photo) VALUES (?,BINARY(?)) ON DUPLICATE KEY UPDATE thumbnail_photo = ? ',
                        [entry.object.userPrincipalName, entry.raw.thumbnailPhoto, entry.raw.thumbnailPhoto],
                      );
                    }
                    conn.release(); // end to pool
                  })
                  .catch(err => {
                    logger.error(`LDAP - ${err}`);
                  });
              }
            });
          },
        );
        */
      }
    });
  } else {
    res.statusCode = 400;
    res.statusMessage = JSON.stringify({ Error: true, Message: 'User not found' });
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.end();
  }
}
