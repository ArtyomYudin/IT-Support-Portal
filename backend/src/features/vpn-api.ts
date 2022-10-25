import { Pool } from 'mariadb';
import { WebSocket } from 'ws';
import { logger } from './logger';
import * as dbSelect from '../shared/db/db_select';

export async function getEmployee(dbPool: Pool, ws: WebSocket) {
  let conn;

  const employeeArray: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getEmployee);
    rows.forEach((row: any, i: number) => {
      employeeArray[i] = {
        id: row.id,
        displayName: row.displayName,
        departmentName: row.departmentName,
        positionName: row.positionName,
      };
    });
    ws.send(
      JSON.stringify({
        event: 'event_employee',
        data: { results: employeeArray, total: employeeArray.length },
      }),
    );
  } catch (error) {
    logger.error(`getEmployee - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getVpnCompletedSession(dbPool: Pool, ws: WebSocket, filter: number) {
  let conn;

  const completedSessionArray: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.vpnCompletedSession(filter));
    rows.forEach((row: any, i: number) => {
      const eventMessageArray = row.eventMessage.split(',');
      const durationArray = eventMessageArray[4].replace(/ Duration: /, '').split(':');
      completedSessionArray[i] = {
        id: row.id,
        sessionStart: new Date(
          row.sessionEnd.getTime() -
            (Number(durationArray[0].replace(/h/, '')) * 60 * 60 * 1000 +
              Number(durationArray[1].replace(/m/, '')) * 60 * 1000 +
              Number(durationArray[2].replace(/s/, '')) * 1000),
        ).toLocaleString(),
        node: row.vpnNode,
        user: eventMessageArray[1].replace(/ Username = /, ''),
        userIP: eventMessageArray[2].replace(/ IP = /, ''),
        // userMappedIP: eventMessageArray,
        duration: eventMessageArray[4].replace(/ Duration: /, ''),
        byteXmt: eventMessageArray[5].replace(/ Bytes xmt: /, ''),
        byteRcv: eventMessageArray[6].replace(/ Bytes rcv: /, ''),
      };
    });
    // console.log(completedSessionArray);
    ws.send(
      JSON.stringify({
        event: 'event_vpn_completed_session',
        data: { results: completedSessionArray, total: completedSessionArray.length },
      }),
    );
  } catch (error) {
    logger.error(`getVpnCompletedSession - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getVpnActiveSession(dbPool: Pool, ws: WebSocket) {
  let conn;

  const activeSessionArray: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.vpnActiveSession);
    rows.forEach((row: any, i: number) => {
      activeSessionArray[i] = {
        sessionStart: row.sessionStart,
        node: row.vpnNode,
        user: row.user.replace('LOCAL\\', ''),
        clientIP: row.clientIP ? row.clientIP.slice(1, -1) : row.clientIP,
        mappedIP: row.mappedIP,
        policyName: row.policyName ? row.policyName.slice(1, -1) : row.policyName,
      };
    });
    // console.log(activeSessionArray);
    ws.send(
      JSON.stringify({
        event: 'event_vpn_active_session',
        data: { results: activeSessionArray, total: activeSessionArray.length },
      }),
    );
  } catch (error) {
    logger.error(`getVpnActiveSession - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}
