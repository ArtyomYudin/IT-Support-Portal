import { initHTTPSServer } from './modules/https-server';
import { dbPool } from './db/db_pool';
import { websocketServer } from './modules/wss-server';

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
  });

  console.log(httpServer.address());
})();
