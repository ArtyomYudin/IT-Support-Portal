import { initHTTPSServer } from './modules/https-server';

(async () => {
  const httpServer = await initHTTPSServer();

  console.log(httpServer.address());
})();
