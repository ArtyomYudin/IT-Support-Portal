import { Server, WebSocket } from 'ws';
import fetch from 'node-fetch';
import { logger } from './logger';

const hardwareGroup: any[] = [];

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
    logger.error(`sendProviderInfo - ${error}`);
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

function sendHardwareGroupEvent(wss: Server<WebSocket>) {
  const hwGroupEvent: any[] = [];
  hardwareGroup.forEach((group: any) => {
    const groupEvent = getHardwareGroupEvent(process.env.ZABBIX_TOKEN, group);
    hwGroupEvent.push(groupEvent);
  });
  Promise.all(hwGroupEvent).then(data => {
    // console.log(data);
    try {
      wss.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_hardware_group_alarm',
            data,
          }),
        );
      });
    } catch (error) {
      logger.error(`sendHardwareGroupEvent - ${error}`);
    }
  });
}

export async function initZabbixAPI(wss: Server<WebSocket>): Promise<void> {
  getHWGroup(process.env.ZABBIX_TOKEN);
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
    sendHardwareGroupEvent(wss);
  }, 60000);
}
