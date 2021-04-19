import https from 'https';
import fs from 'fs';
import path from 'path';
import { constants } from 'crypto';
import { config } from 'dotenv';
import { checkUserCredentials } from '../services/ldap-auth';

config();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
  // 'Access-Control-Max-Age': 2592000, // 30 days
};
const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../cert/center_inform.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../cert/center_inform.crt')),
  requestCert: false,
  // secureProtocol: 'SSLv23_method',
  secureOptions: constants.SSL_OP_NO_SSLv3 || constants.SSL_OP_NO_SSLv2,
};

export function initHTTPSServer(): https.Server {
  function onError(error: any) {
    if (error.syscall !== 'listen') {
      // throw error;
      console.log("Well, this didn't work...");
    }
  }

  const server = https
    .createServer(options, (req, res) => {
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.end();
      }

      let body: any = [];

      req.on('error', err => {
        // logger.error(err);
      });
      req.on('data', chunk => body.push(chunk));
      req.on('end', () => {
        body = Buffer.concat(body).toString();
        res.on('error', err => {
          // logger.error(err);
        });
        if (req.url === '/api/auth' && req.method === 'POST') {
          console.log('Resive post', body);
          checkUserCredentials(body, res);
        }
      });
    })
    .listen(parseInt(process.env.HTTPS_PORT!, 10), process.env.HTTPS_HOSTNAME!, () => {
      console.log(`Server is listening on port ${process.env.HTTPS_PORT}`);
    })
    .on('error', onError);
  return server;
}
