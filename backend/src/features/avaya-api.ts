import { Pool } from 'mariadb';
import { WebSocket } from 'ws';
import { logger } from './logger';
import * as dbSelect from '../shared/db/db_select';

export async function getAvayaCDR(dbPool: Pool, ws: WebSocket, value: string) {
  let conn;
  const allUserRequestArray: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.userRequestList);
    rows.forEach((row: any, i: number) => {
      allUserRequestArray[i] = {
        id: row.id,
        callStart: row.callStart,
        callDuration: row.callDuration,
        callingNumber: row.callingNumber,
        calledNumber: row.calledNumber,
        callingName: row.callingName,
        calledName: row.calledName,
        callCode: row.callCode,
      };
    });

    ws.send(
      JSON.stringify({
        event: 'event_avaya_cdr',
        data: { results: allUserRequestArray, total: allUserRequestArray.length },
      }),
    );
  } catch (error) {
    logger.error(`getAvayaCDR - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}
