import tls from 'tls';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';

// tls.DEFAULT_MIN_VERSION = 'TLSv1';

const options = {
  // requestCert: false,
  secureProtocol: 'TLSv1_method',
  rejectUnauthorized: false,
  key: fs.readFileSync(path.resolve(__dirname, '../../cert/ssl.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../../cert/cert.pem')),
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

// Соединение с сервером Revers 8000 API
export function initPacsSocket() {
  const socket = tls.connect(parseInt(process.env.PACS_PORT as string, 10), process.env.PACS_HOST as string, options, () => {
    logger.info(`Pacs API client connected${socket.authorized ? ' authorized' : ' unauthorized'}`);
    socket.write(createBuffer(filterEventsCommand));
    process.stdin.pipe(socket);
    process.stdin.resume();
  });
  socket.setKeepAlive(true);
  return socket;
}
