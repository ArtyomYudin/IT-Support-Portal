import { Pool } from 'mariadb';
import { Server, WebSocket } from 'ws';
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

export function allPurchaseRequest(dbPool: Pool, ws: WebSocket): void {
  const allPurchaseRequestArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.purchaseRequestList).then(rows => {
        rows.forEach((row: any, i: number) => {
          allPurchaseRequestArray[i] = row;
        });
        // console.log(allPurchaseRequestArray);
        ws.send(
          JSON.stringify({
            event: 'event_purchase_request_all',
            data: allPurchaseRequestArray,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getFilteredEmployee(dbPool: Pool, ws: WebSocket, value: string): void {
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

export function getEmployeeByEmail(dbPool: Pool, ws: WebSocket, value: string): void {
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

export function savePurcheseRequestAsDraft(dbPool: Pool, ws: WebSocket, value: any): void {
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

export function init(dbPool: Pool, wss: Server<WebSocket>, ws: WebSocket) {
  allPurchaseRequest(dbPool, ws);
}

// async function purchaseRequsetEvents(wss, clientId) {
//  setInterval(() => {
//    currentDayAvayaCDR(wss, clientId);
// }, 60000);
// }

// exports.purchaseRequestEvents = purchaseRequestEvents;
