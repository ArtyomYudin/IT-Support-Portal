import { Pool } from 'mariadb';
import * as dbSelect from '../db/db_select';

export function wsParseMessage(dbPool: Pool, ws: import('ws'), msg: any): void {
  function getFilteredEmployee(value: string): void {
    dbPool
      .getConnection()
      .then(conn => {
        conn.query(dbSelect.getFilteredEmployee(value)).then(rows => {
          console.log(value);
          console.log(rows);
          ws.send(
            JSON.stringify({
              event: 'event_filtered_employee',
              data: rows,
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
    case 'getFilteredRespPerson':
      // console.log(`Connection test ${parseMsg.data}`);
      getFilteredEmployee(parseMsg.data);
      break;

    default:
      break;
  }
}
