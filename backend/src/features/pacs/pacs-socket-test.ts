import tls from 'node:tls';
import fs from 'node:fs';
import path from 'node:path';

tls.DEFAULT_MIN_VERSION = 'TLSv1';

const options = {
  // requestCert: false,
  // secureProtocol: 'TLSv1_method',
  // minVersion: 'TLSv1',
  rejectUnauthorized: false,
  key: fs.readFileSync(path.resolve(__dirname, '../../cert/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../../cert/cert.pem')),
  ca: [fs.readFileSync(path.resolve(__dirname, '../../cert/cert.pem'))],
  // ciphers: 'TLS_RSA_WITH_AES_256_CBC_SHA',
  checkServerIdentity: () => {
    return undefined;
  },
};

const filterEventsCommand = JSON.stringify({
  Command: 'filterevents',
  Id: 1,
  Version: 1,
  Filter: 1,
});

function createBuffer(postJSONData: any) {
  const buffer = Buffer.from(postJSONData);
  const bufferWithByte = Buffer.alloc(4 + buffer.length);
  bufferWithByte.writeInt32LE(buffer.length, 0);
  buffer.copy(bufferWithByte, 4);
  return bufferWithByte;
}

const socket = tls.connect(24532, '172.21.110.139', options, () => {
  console.log('client connected', socket.authorized ? 'authorized' : 'unauthorized');
  process.stdin.pipe(socket);
  process.stdin.resume();
});

socket.setEncoding('utf8');
socket.write(createBuffer(filterEventsCommand));
socket.on('data', data => {
  console.log(data);
});

socket.on('end', () => {
  console.log('server ends connection');
});
