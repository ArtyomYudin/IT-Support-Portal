import { Pool } from 'mariadb';
import * as dbSelect from '../../shared/db/db_select';

export function wsParseMessage(dbPool: Pool, ws: import('ws'), msg: any): void {
  function getFilteredEmployee(value: string): void {
    const filteredEmployeeArray: any[] = [];
    dbPool
      .getConnection()
      .then(conn => {
        conn.query(dbSelect.getFilteredEmployee(value)).then(rows => {
          rows.forEach((row: any, i: number) => {
            filteredEmployeeArray[i] = { id: row.id, name: row.name };
          });
          console.log(filteredEmployeeArray);
          ws.send(
            JSON.stringify({
              event: 'event_filtered_employee',
              data: filteredEmployeeArray || null,
            }),
          );
        });
        conn.release(); // release to pool
      })
      .catch(err => {
        console.log(`not connected due to error: ${err}`);
      });
  }

  function getEmployeeByEmail(value: string): void {
    let employeeByEmail: any = {};
    dbPool
      .getConnection()
      .then(conn => {
        conn.query(dbSelect.getEmployeeByEmail(value)).then(rows => {
          rows.forEach((row: any) => {
            employeeByEmail = row;
          });
          console.log(employeeByEmail);
          ws.send(
            JSON.stringify({
              event: 'event_employee_by_email',
              data: employeeByEmail || null,
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
    case 'purchaseRequestInit':
      getEmployeeByEmail(parseMsg.data);
      console.log(parseMsg.data);
      break;
    default:
      break;
  }
}
