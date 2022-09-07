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

export function getEmployeeByUPN(dbPool: Pool, ws: WebSocket, value: string): void {
  let employeeByUPN: any = {};
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getEmployeeByUPN(value)).then(rows => {
        rows.forEach((row: any) => {
          employeeByUPN = row;
        });
        ws.send(
          JSON.stringify({
            event: 'event_employee_by_upn',
            data: employeeByUPN,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getEmployeeByParentDepartment(dbPool: Pool, ws: WebSocket, value: number): void {
  const employeeByParentDepartment: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getEmployeeByParentDepartment(value)).then(rows => {
        rows.forEach((row: any, i: number) => {
          employeeByParentDepartment[i] = { id: row.id, name: row.displayName };
        });
        console.log(employeeByParentDepartment);
        ws.send(
          JSON.stringify({
            event: 'event_employee_by_parent_department',
            data: employeeByParentDepartment,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getPurchaseRequestInitInfo(dbPool: Pool, ws: WebSocket, value: string): void {
  let purchaseRequestInitByUPN: any = {};
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getPurchaseRequestInitInfoByUPN(value)).then(rows => {
        rows.forEach((row: any) => {
          purchaseRequestInitByUPN = row;
        });
        ws.send(
          JSON.stringify({
            event: 'event_purchase_request_init_info',
            data: purchaseRequestInitByUPN,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getPurchaseRequestApproversByUPN(dbPool: Pool, ws: WebSocket, value: string): void {
  let purchaseRequestApproversByUPN: any = {};
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getPurchaseRequestApproversByUPN(value)).then(rows => {
        rows.forEach((row: any) => {
          purchaseRequestApproversByUPN = row;
        });
        ws.send(
          JSON.stringify({
            event: 'event_purchase_request_approvers_by_upn',
            data: purchaseRequestApproversByUPN,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function savePurcheseRequest(dbPool: Pool, ws: WebSocket, value: any): void {
  dbPool
    .getConnection()
    .then(conn => {
      try {
        conn.query(
          dbInsert.insertPurchaseRequest(
            changeDateFormat(new Date()),
            value.purchaseTarget,
            value.responsiblePersonId,
            value.expenseItem,
            value.purchaseReason,
            value.purchaseAuthorIdId,
            value.purchaseRequestStatus,
          ),
        );
      } catch (error) {
        console.log(error);
      }
      console.log(value.purchaseTarget);
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
