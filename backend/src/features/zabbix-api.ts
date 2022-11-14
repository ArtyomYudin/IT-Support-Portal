import { Server, WebSocket } from 'ws';
import fetch from 'node-fetch';
import { Pool } from 'mariadb';
import { logger } from './logger';
import { getVpnActiveSessionCount } from './vpn-api';

const hardwareGroup: any[] = [];

// Log in and obtain an authentication token.
/*
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
*/
async function getHWGroup(token: string | undefined) {
  hardwareGroup.length = 0;
  const postData = {
    jsonrpc: '2.0',
    method: 'hostgroup.get',
    id: 1,
    auth: token,
    params: {
      output: ['groupid', 'name'],
    },
  };
  try {
    const dataResponse = await fetch(process.env.ZABBIX_HOST as string, {
      method: 'post',
      body: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json-rpc' },
    });
    const dataJSON = await dataResponse.json();
    dataJSON.result.forEach((group: { groupid: any; name: any }) => {
      hardwareGroup.push({ id: group.groupid, name: group.name });
    });
  } catch (error) {
    logger.error(`getHWGroup - ${error}`);
  }
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

async function sendProviderInfo(wss: Server<WebSocket>, ws?: WebSocket) {
  // logger.info(data);
  const providerInfo = await getProviderInfo(process.env.ZABBIX_TOKEN);
  try {
    const providerSpeed = {
      inSpeedOrange: (providerInfo[8].lastvalue / 1000 / 1000).toFixed(2),
      outSpeedOrange: (providerInfo[11].lastvalue / 1000 / 1000).toFixed(2),
      inSpeedTelros: (providerInfo[0].lastvalue / 1000 / 1000).toFixed(2),
      outSpeedTelros: (providerInfo[3].lastvalue / 1000 / 1000).toFixed(2),
      inSpeedFilanco: (providerInfo[1].lastvalue / 1000 / 1000).toFixed(2),
      outSpeedFilanco: (providerInfo[4].lastvalue / 1000 / 1000).toFixed(2),
      // bgp62: data[3].lastvalue,
      // bgp176: data[2].lastvalue,
    };
    if (ws) {
      ws.send(
        JSON.stringify({
          event: 'event_provider_info',
          data: providerSpeed,
        }),
      );
    } else {
      wss.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_provider_info',
            data: providerSpeed,
          }),
        );
      });
    }
  } catch (error) {
    logger.error(`sendProviderInfo - ${error}`);
  }
}

async function getAvayaE1ChannelInfo(wss: Server<WebSocket>, ws?: WebSocket) {
  let activeChannel = 0;
  const postData = {
    jsonrpc: '2.0',
    method: 'item.get',
    id: 1,
    auth: process.env.ZABBIX_TOKEN,
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
    if (ws) {
      ws.send(
        JSON.stringify({
          event: 'event_avaya_e1_info',
          data: { activeChannel, allChannel: dataJSON.result.length },
        }),
      );
    } else {
      wss.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_avaya_e1_info',
            data: { activeChannel, allChannel: dataJSON.result.length },
          }),
        );
      });
    }
  } catch (error) {
    logger.error(`getAvayaE1ChannelInfo - ${error}`);
  }
}

async function getHardwareGroupEvent(token: string | undefined, hwGroup: any) {
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
    return { group: hwGroup.name, event: dataJSON.result, count: dataJSON.result.length };
  } catch (error) {
    logger.error(`getHardwareEvent - ${error}`);
    return false;
  }
}

async function sendHardwareGroupEvent(wss: Server<WebSocket>, ws?: WebSocket) {
  const hwGroupEvent: any[] = [];
  hardwareGroup.forEach((group: any) => {
    const groupEvent = getHardwareGroupEvent(process.env.ZABBIX_TOKEN, group);
    hwGroupEvent.push(groupEvent);
  });
  const eventData = await Promise.all(hwGroupEvent);
  // Promise.all(hwGroupEvent).then(data => {
  // console.log(eventData);
  try {
    if (ws) {
      ws.send(
        JSON.stringify({
          event: 'event_hardware_group_alarm',
          data: eventData,
        }),
      );
    } else {
      wss?.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_hardware_group_alarm',
            data: eventData,
          }),
        );
      });
    }
  } catch (error) {
    logger.error(`sendHardwareGroupEvent - ${error}`);
  }
  // });
}

export function getDashboardEvent(dbPool: Pool, wss: Server<WebSocket>, ws: WebSocket) {
  sendProviderInfo(wss, ws);
  sendHardwareGroupEvent(wss, ws);
  getAvayaE1ChannelInfo(wss, ws);
  getVpnActiveSessionCount(dbPool, wss, ws);
}

export async function initZabbixAPI(dbPool: Pool, wss: Server<WebSocket>): Promise<void> {
  getHWGroup(process.env.ZABBIX_TOKEN);
  setInterval(() => {
    sendProviderInfo(wss);
  }, 30000);

  setInterval(() => {
    getAvayaE1ChannelInfo(wss);
    sendHardwareGroupEvent(wss);
    getVpnActiveSessionCount(dbPool, wss);
  }, 60000);
}
