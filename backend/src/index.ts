import { initHTTPSServer } from './modules/https-server';
import { dbPool } from './db/db_pool';
import { websocketServer } from './modules/wss-server';
import { wsParseMessage } from './modules/wss-api';

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
})();
