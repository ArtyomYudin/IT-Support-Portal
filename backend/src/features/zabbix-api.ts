import { Server, WebSocket } from 'ws';
import fetch from 'node-fetch';
import { logger } from './logger';

const hardwareGroup = {
  7: 'ups',
  10: 'switch',
  13: 'vmware',
  17: 'router',
  21: 'server',
};

// Log in and obtain an authentication token.
async function getAuthToken() {
  const authData = {
    jsonrpc: '2.0',
    method: 'user.login',
    params: {
      user: process.env.ZABBIX_USER as string,
      password: process.env.ZABBIX_PASSWORD as string,
    },
    id: 1,
    auth: null,
  };

  logger.info('Processing Zabbix Auth.');

  const authTokenResponse = await fetch(process.env.ZABBIX_HOST as string, {
    method: 'post',
    body: JSON.stringify(authData),
    headers: { 'Content-Type': 'application/json-rpc' },
  });
  const tokenJSON: any = await authTokenResponse.json();
  return tokenJSON.result;
}

async function getProviderInfo(token: any) {
  const postData = {
    jsonrpc: '2.0',
    method: 'item.get',
    id: 1,
    auth: token,
    params: {
      hostids: [10149, 10199],
      output: ['hostid', 'key_', 'name', 'lastvalue'],
      filter: {
        key_: [
          'net.if.in[ifHCInOctets.6]',
          'net.if.out[ifHCOutOctets.6]',
          'net.if.in[ifHCInOctets.3]',
          'net.if.out[ifHCOutOctets.3]',
          'net.if.in[ifHCInOctets.4]',
          'net.if.out[ifHCOutOctets.4]',
          // 'ciscoBgpPeerAdminStatus[176.221.9.165]',
          // 'ciscoBgpPeerAdminStatus[62.152.42.13]',
        ],
      },
    },
  };

  const dataResponse = await fetch(process.env.ZABBIX_HOST as string, {
    method: 'post',
    body: JSON.stringify(postData),
    headers: { 'Content-Type': 'application/json-rpc' },
  });
  const dataJSON = await dataResponse.json();
  return dataJSON.result;
}

async function sendProviderInfo(wss: Server<WebSocket>, data: any) {
  // logger.info(data);
  const providerSpeed = {
    inSpeedOrange: (data[8].lastvalue / 1000 / 1000).toFixed(2),
    outSpeedOrange: (data[11].lastvalue / 1000 / 1000).toFixed(2),
    inSpeedTelros: (data[0].lastvalue / 1000 / 1000).toFixed(2),
    outSpeedTelros: (data[3].lastvalue / 1000 / 1000).toFixed(2),
    inSpeedFilanco: (data[1].lastvalue / 1000 / 1000).toFixed(2),
    outSpeedFilanco: (data[4].lastvalue / 1000 / 1000).toFixed(2),
    // bgp62: data[3].lastvalue,
    // bgp176: data[2].lastvalue,
  };
  try {
    wss.clients.forEach((client: any) => {
      client.send(
        JSON.stringify({
          event: 'event_provider_info',
          data: providerSpeed,
        }),
      );
    });
  } catch (error) {
    logger.error(error);
  }
}

export async function initZabbixAPI(wss: Server<WebSocket>): Promise<void> {
  const token = await getAuthToken();
  setInterval(() => {
    getProviderInfo(token).then(data => {
      sendProviderInfo(wss, data);
    });
  }, 30000);
}
