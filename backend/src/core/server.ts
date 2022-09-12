import { initHTTPSServer } from '../features/https-server';
import { dbPool } from '../shared/db/db_pool';
import { websocketServer } from '../features/wss/wss-server';
import { wsParseMessage } from '../features/wss/wss-api';
import * as purchaseAPI from '../features/purchase-api';
import { getEmails } from '../features/imap-client';

// import { monitoringBot } from '../features/jabber-bot';

// Отлов событий uncaughtException и закрытие процесса. Далее pm2 перезапускает службу
process.on('uncaughtException', err => {
  console.log('Uncaught Exception, Restart service !!!');
  console.log(err.stack);
  process.exit(1);
});

(async () => {
  const httpServer = await initHTTPSServer(dbPool);
  const wss = websocketServer(httpServer);
  const clients: any[] = [];

  wss.on('connection', ws => {
    const id = Math.random();
    clients[id] = ws;
    console.log(`New connection ${id}`);

    purchaseAPI.init(dbPool, wss, ws);
    ws.on('close', () => {
      console.log(`Connection closed ${id}`);
      delete clients[id];
    });

    ws.on('message', msg => {
      wsParseMessage(dbPool, ws, msg);
    });
  });

  setInterval(() => {
    getEmails();
  }, 10000);

  console.log(httpServer.address());
  // monitoringBot.say({
  //  user: 'a.yudin@center-inform.ru',
  //  text: 'hi!',
  // });
})();
