import { Server, WebSocket } from 'ws';
import fetch from 'node-fetch';
import { isAnyArrayBuffer } from 'util/types';
import { logger } from './logger';

const hardwareGroup = [
  { id: 7, name: 'ups' },
  { id: 10, name: 'switch' },
  { id: 13, name: 'vmware' },
  { id: 17, name: 'router' },
  { id: 21, name: 'server' },
];

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

async function getProviderInfo(token: string | undefined) {
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
  try {
    const dataResponse = await fetch(process.env.ZABBIX_HOST as string, {
      method: 'post',
      body: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json-rpc' },
    });
    const dataJSON = await dataResponse.json();
    return dataJSON.result;
  } catch (error) {
    logger.error(`getProviderInfo - ${error}`);
    return false;
  }
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

async function getAvayaE1ChannelInfo(token: string | undefined) {
  let activeChannel = 0;
  const postData = {
    jsonrpc: '2.0',
    method: 'item.get',
    id: 1,
    auth: token,
    params: {
      hostids: [10254],
      output: ['hostid', 'key_', 'lastvalue'],
      sortfield: 'itemid',
    },
  };
  try {
    const dataResponse = await fetch(process.env.ZABBIX_HOST as string, {
      method: 'post',
      body: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json-rpc' },
    });
    const dataJSON = await dataResponse.json();
    dataJSON.result.forEach((channel: any) => {
      if (channel.lastvalue === 'in-service/active') {
        activeChannel += 1;
      }
    });
    return { activeChannel, allChannel: dataJSON.result.length };
  } catch (error) {
    logger.error(`getAvayaE1ChannelInfo - ${error}`);
    return false;
  }
}

async function getHardwareEvent(token: string | undefined, hwGroup: any) {
  try {
    const postData = {
      jsonrpc: '2.0',
      method: 'problem.get',
      id: 1,
      auth: token,
      params: {
        groupids: hwGroup.id,
        severities: [2, 3, 4, 5],
        sortfield: ['eventid'],
        sortorder: 'DESC',
      },
    };
    const dataResponse = await fetch(process.env.ZABBIX_HOST as string, {
      method: 'post',
      body: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json-rpc' },
    });
    const dataJSON = await dataResponse.json();
    return dataJSON.result;
  } catch (error) {
    logger.error(`getHardwareEvent - ${error}`);
    return false;
  }
}

export async function initZabbixAPI(wss: Server<WebSocket>): Promise<void> {
  setInterval(() => {
    getProviderInfo(process.env.ZABBIX_TOKEN).then(data => {
      sendProviderInfo(wss, data);
    });
  }, 30000);

  setInterval(() => {
    getAvayaE1ChannelInfo(process.env.ZABBIX_TOKEN).then(data => {
      wss.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_avaya_e1_info',
            data,
          }),
        );
      });
    });
  }, 60000);
  setInterval(() => {
    hardwareGroup.forEach((group: any, i: number) => {
      getHardwareEvent(process.env.ZABBIX_TOKEN, group);
    });
  }, 60000);
}
