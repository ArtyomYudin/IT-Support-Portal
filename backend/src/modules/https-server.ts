import https from 'https';
import fs from 'fs';
import path from 'path';
import util from 'util';

const hostname = '127.0.0.1';
const port = 4443;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
  // 'Access-Control-Max-Age': 2592000, // 30 days
};

function readCert() {
  const readFile = util.promisify(fs.readFile);
  let key;
  let cert;

  readFile(path.resolve(__dirname, '../cert/center_inform.key')).then(keyPem => {
    key = keyPem;
  });
  readFile(path.resolve(__dirname, '../cert/center_inform.crt')).then(certPem => {
    cert = certPem;
  });
  return [key, cert];
}

export function initHTTPSServer(): https.Server {
  function onError(error: any) {
    if (error.syscall !== 'listen') {
      // throw error;
      console.log("Well, this didn't work...");
    }
  }
  const [key, cert] = readCert();
  const server = https
    .createServer({ key, cert }, (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Hello World');
    })
    .listen(port, hostname, () => {
      console.log(`Server is listening on port ${port}`);
    })
    .on('error', onError);
  return server;
}
