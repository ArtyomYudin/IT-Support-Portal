import { Pool } from 'mariadb';
import { WebSocket } from 'ws';
import { logger } from './logger';
import * as dbSelect from '../shared/db/db_select';

export async function getAvayaCDR(dbPool: Pool, ws: WebSocket, filter: number) {
  let conn;
  // let filter;
  const avayaCDRArray: any[] = [];
  // if (value) {
  //  filter = 'WHERE ';
  // }
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.avayaCDRList(filter));
    rows.forEach((row: any, i: number) => {
      avayaCDRArray[i] = {
        id: row.id,
        callStart: row.callStart,
        callDuration: row.callDuration,
        callingNumber: row.callingNumber,
        callingName: row.callingName,
        calledNumber: row.calledNumber,
        calledName: row.calledName,
        callCode: row.callCode,
      };
    });
    ws.send(
      JSON.stringify({
        event: 'event_avaya_cdr',
        data: { results: avayaCDRArray, total: avayaCDRArray.length },
      }),
    );
  } catch (error) {
    logger.error(`getAvayaCDR - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}
