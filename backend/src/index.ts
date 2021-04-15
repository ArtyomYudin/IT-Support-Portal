import { initHTTPSServer } from './modules/https-server';
import { websocketServer } from './modules/wss-server';

(async () => {
  const httpServer = await initHTTPSServer();
  //const wss = websocketServer(httpServer);

  console.log(httpServer.address());
})();
