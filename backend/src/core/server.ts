// import winston from 'winston';
import { logger } from '../features/logger';
import { initHTTPSServer } from '../features/https-server';
import { dbPool } from '../shared/db/db_pool';
import { websocketServer } from '../features/wss/wss-server';
import { wsParseMessage } from '../features/wss/wss-api';
import * as purchaseAPI from '../features/purchase-api';
import { getEmails } from '../features/imap-client';

// Отлов событий uncaughtException и закрытие процесса. Далее pm2 перезапускает службу
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception, Restart service !!!');
  logger.error(err.stack);
  process.exit(1);
});

(async () => {
  const httpServer = await initHTTPSServer(dbPool);
  const wss = websocketServer(httpServer);
  const clients: any[] = [];

  wss.on('connection', ws => {
    const id = Math.random();
    clients[id] = ws;
    logger.info(`WebSocket - New connection ${id}`);

    purchaseAPI.init(dbPool, wss, ws);
    ws.on('close', () => {
      logger.info(`WebSocket - Connection closed ${id}`);
      delete clients[id];
    });

    ws.on('message', msg => {
      wsParseMessage(dbPool, ws, wss, msg);
    });
  });

  setInterval(() => {
    getEmails(wss);
  }, 30000);
})();
