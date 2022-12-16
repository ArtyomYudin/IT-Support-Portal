import { Pool } from 'mariadb';
import { Server, WebSocket } from 'ws';
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
        userPrincipalName: row.userPrincipalName,
        displayName: row.displayName,
        departmentName: row.departmentName,
        positionName: row.positionName,
        thumbnailPhoto: row.thumbnailPhoto ? Buffer.from(row.thumbnailPhoto).toString('base64') : null,
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

export async function getVpnCompletedSession(dbPool: Pool, ws: WebSocket, value: any) {
  let conn;

  const completedSessionArray: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.vpnCompletedSession(value.period, value.employeeUpn));
    rows.forEach((row: any, i: number) => {
      const durationArray = row.duration.replace(/\s/g, ':').split(':');
      const durrationArraylength = durationArray.length;
      const dayToMs = durrationArraylength === 4 ? Number(durationArray[0].replace(/d/, '')) * 24 * 60 * 60 * 1000 : 0;
      completedSessionArray[i] = {
        sessionStart: new Date(
          row.sessionEnd.getTime() -
            (dayToMs +
              Number(durationArray[durrationArraylength - 3].replace(/h/, '')) * 60 * 60 * 1000 +
              Number(durationArray[durrationArraylength - 2].replace(/m/, '')) * 60 * 1000 +
              Number(durationArray[durrationArraylength - 1].replace(/s/, '')) * 1000),
        ).toLocaleString(),
        node: row.vpnNode,
        user: row.user,
        displayName: row.displayName,
        type: row.type,
        duration: row.duration,
        clientIP: row.ip,
        byteXmt: row.byteXmt,
        byteRcv: row.byteRcv,
        disconnectReason: row.reason,
      };
    });

    ws.send(
      JSON.stringify({
        event: value.employeeUpn ? 'event_vpn_completed_session_by_upn' : 'event_vpn_completed_session',
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
        user: row.vpnUser,
        displayName: row.displayName,
        clientIP: row.clientIP ? row.clientIP.slice(1, -1) : row.clientIP,
        mappedIP: row.mappedIP,
        policyName: row.policyName ? row.policyName.slice(1, -1) : row.policyName,
      };
    });

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

export async function getVpnActiveSessionCount(dbPool: Pool, wss: Server<WebSocket>, ws?: WebSocket) {
  let conn;

  const activeSessionCountArray: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.vpnActiveSessionCount);
    rows.forEach((row: any, i: number) => {
      activeSessionCountArray[i] = {
        node: row.vpnNode,
        count: row.count.toString(),
      };
    });
    // console.log(activeSessionCountArray);
    if (ws) {
      ws.send(
        JSON.stringify({
          event: 'event_vpn_active_session_count',
          data: activeSessionCountArray,
        }),
      );
    } else {
      wss.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_vpn_active_session_count',
            data: activeSessionCountArray,
          }),
        );
      });
    }
  } catch (error) {
    logger.error(`getVpnActiveSessionCount - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}
