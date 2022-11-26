// import winston from 'winston';
import { logger } from '../features/logger';
import { initHTTPSServer } from '../features/https-server';
import { dbPool } from '../shared/db/db_pool';
import { websocketServer } from '../features/wss/wss-server';
import { wsParseMessage } from '../features/wss/wss-api';
import { getEmails } from '../features/imap-client';
import { initZabbixAPI } from '../features/zabbix-api';
import { initPacsSocket } from '../features/pacs/pacs-socket';
import * as pacsAPI from '../features/pacs/pacs-api';

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception, Restart service !!!');
  logger.error(err.stack);
  process.exit(1);
});

(async () => {
  const httpServer = await initHTTPSServer(dbPool);
  const wss = await websocketServer(httpServer);
  initZabbixAPI(dbPool, wss);
  const pacsSocket = await initPacsSocket();

  const clients: any[] = [];

  wss.on('connection', ws => {
    const id = Math.random();
    clients[id] = ws;
    logger.info(`WebSocket - New connection ${id}`);

    ws.on('close', () => {
      logger.info(`WebSocket - Connection closed ${id}`);
      delete clients[id];
    });

    ws.on('message', msg => {
      wsParseMessage(dbPool, ws, wss, msg);
    });
  });

  pacsSocket.on('data', data => {
    try {
      const resive = JSON.parse(data.slice(4).toString());
      logger.info(resive);
      console.log(resive);
      if (resive.Command === 'ping') pacsAPI.sendPing(resive.Id, pacsSocket);
      if (resive.Command === 'events') pacsAPI.parseEvent(dbPool, wss, data.slice(4));
    } catch (e) {
      logger.error({ 'Pacs error: ': e });
    }
  });

  pacsSocket.on('end', () => {
    pacsSocket.destroy();
    logger.info('Pacs API client disconnected from server');
  });

  pacsSocket.on('error', err => {
    pacsSocket.destroy();
    logger.error({ 'Pacs API connect error:': err });
    process.exit(1);
    // socket = initApiSocket();
  });

  setInterval(() => {
    getEmails(wss);
  }, 30000);
})();
