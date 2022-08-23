import { Pool } from 'mariadb';
import * as dbSelect from '../shared/db/db_select';
import * as dbInsert from '../shared/db/db_insert';

function ConvertTo2Digits(newNum: number) {
  return newNum.toString().padStart(2, '0');
}

function changeDateFormat(newDate: Date) {
  return `${[newDate.getFullYear(), ConvertTo2Digits(newDate.getMonth() + 1), ConvertTo2Digits(newDate.getDate())].join('-')} ${[
    ConvertTo2Digits(newDate.getHours()),
    ConvertTo2Digits(newDate.getMinutes()),
    ConvertTo2Digits(newDate.getSeconds()),
  ].join(':')}`;
}

function getFilteredEmployee(value: string): void {
  const filteredEmployeeArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getFilteredEmployee(value)).then(rows => {
        rows.forEach((row: any, i: number) => {
          filteredEmployeeArray[i] = { id: row.id, displayName: row.displayName };
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

function savePurcheseRequestAsDraft(value: any): void {
  dbPool
    .getConnection()
    .then(conn => {
      try {
        conn.query(
          dbInsert.insertPurchaseRequest(
            changeDateFormat(new Date()),
            value.purchaseTarget,
            value.responsiblePersonId,
            value.purchaseReason,
            value.purchaseAuthorIdId,
          ),
        );
      } catch (error) {
        console.log(error);
      }

      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

function initApi(wss, clientId) {
  // currentDayAvayaCDR(wss, clientId);
}

// async function purchaseRequsetEvents(wss, clientId) {
//  setInterval(() => {
//    currentDayAvayaCDR(wss, clientId);
// }, 60000);
// }

exports.init = initApi;
// exports.purchaseRequestEvents = purchaseRequestEvents;