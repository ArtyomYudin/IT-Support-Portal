import https from 'https';
import fs from 'fs';
import path from 'path';
import { constants } from 'crypto';
import { Pool } from 'mariadb';
import { TLSSocket } from 'tls';
import { logger } from './logger';
import { checkUserCredentials } from './ldap-auth';
import * as pacsAPI from './pacs/pacs-api';

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

export function initHTTPSServer(dbPool: Pool, pacsSocket: TLSSocket): https.Server {
  function onError(error: any) {
    if (error.syscall !== 'listen') {
      logger.error(`HTTPS - ${error}`);
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
        logger.error('HTTPS - REQ error:', err);
      });
      req.on('data', chunk => body.push(chunk));
      req.on('end', () => {
        body = Buffer.concat(body).toString();
        res.on('error', err => {
          logger.error('HTTPS - RES error:', err);
        });
        if (req.url === '/api/auth' && req.method === 'POST') {
          // console.log('Resive post', body);
          checkUserCredentials(body, res, dbPool);
        }
        if (req.url === '/guest_card/api' && req.method === 'POST') {
          // pacsAPI.sendExtJSON(body, pacsSocket, dbPool);
          // res.end();
        }
      });
    })
    .listen(parseInt(process.env.HTTPS_PORT as string, 10), process.env.HTTPS_HOST as string, () => {
      logger.info(`HTTPS - Server is listening on port ${process.env.HTTPS_PORT}`);
    })
    .on('error', onError);
  return server;
}
