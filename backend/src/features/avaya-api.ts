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
        creationDate: row.creationDate,
        changeDate: row.changeDate,
        requestNumber: row.requestNumber,
        initiator: row.initiator,
        department: row.department,
        executor: { id: row.executorId, name: row.executorName },
        service: row.service,
        topic: row.topic,
        description: row.description,
        status: { id: row.statusId, name: row.statusName, icon: row.statusIcon },
        priority: { id: row.priority_id, name: row.priorityName, color: row.priorityColor },
        deadline: row.deadline,
      };
    });

    ws.send(
      JSON.stringify({
        event: 'event_user_request_all',
        data: { results: allUserRequestArray, total: allUserRequestArray.length },
      }),
    );
  } catch (error) {
    logger.error(`avayaCDR - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}
