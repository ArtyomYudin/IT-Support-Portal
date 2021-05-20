import { Pool } from 'mariadb';
import * as dbSelect from '../db/db_select';

export function wsParseMessage(dbPool: Pool, ws: import('ws'), msg: any): void {
  function getAllEmployee(): void {
    dbPool
      .getConnection()
      .then(conn => {
        conn.query(dbSelect.getAllEmployee).then(rows => {
          // console.log(rows[0].name);
          ws.send(
            JSON.stringify({
              event: 'event_all_employee',
              data: rows[0].name,
            }),
          );
        });
        conn.release(); // release to pool
      })
      .catch(err => {
        console.log(`not connected due to error: ${err}`);
      });
  }

  const parseMsg = JSON.parse(msg);
  switch (parseMsg.event) {
    case 'requestInit':
      // console.log(`Connection test ${parseMsg.data}`);
      getAllEmployee();
      break;

    default:
      break;
  }
}
