import { initHTTPSServer } from '../features/https-server';
import { dbPool } from '../shared/db/db_pool';
import { websocketServer } from '../features/wss/wss-server';
import { wsParseMessage } from '../features/wss/wss-api';
import { monitoringBot } from '../features/jabber-bot';

(async () => {
  const httpServer = await initHTTPSServer();
  const wss = websocketServer(httpServer);
  const clients: any[] = [];

  wss.on('connection', ws => {
    const id = Math.random();
    clients[id] = ws;
    console.log(`New connection ${id}`);

    ws.on('close', () => {
      console.log(`Connection closed ${id}`);
      delete clients[id];
    });

    ws.on('message', msg => {
      wsParseMessage(dbPool, ws, msg);
    });
  });
  console.log(httpServer.address());
  monitoringBot.say({
    user: 'a.yudin@center-inform.ru',
    text: 'hi!',
  });
})();
