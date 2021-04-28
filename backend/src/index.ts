import { initHTTPSServer } from './modules/https-server';
import { pool } from './db/db_pool';
import { websocketServer } from './modules/wss-server';

(async () => {
  const httpServer = await initHTTPSServer();
  // const wss = websocketServer(httpServer);
  // pool.getConnection();
  console.log(httpServer.address());
})();
