import { Pool } from 'mariadb';
import { Server, WebSocket } from 'ws';

import * as purchaseAPI from '../purchase-api';
import * as userRequestAPI from '../user-request-api';

export function wsParseMessage(dbPool: Pool, ws: WebSocket, wss: Server<WebSocket>, msg: any): void {
  /*
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
*/
  const parseMsg = JSON.parse(msg);
  switch (parseMsg.event) {
    case 'getFilteredRespPerson':
      userRequestAPI.getFilteredEmployee(dbPool, ws, parseMsg.data);
      break;
    case 'getFilteredRequestInitiator':
      userRequestAPI.getFilteredEmployee(dbPool, ws, parseMsg.data);
      break;
    case 'purchaseRequestInit':
      purchaseAPI.getPurchaseRequestInitInfo(dbPool, ws, parseMsg.data);
      break;
    case 'purchaseRequestAsDraft':
      purchaseAPI.savePurcheseRequest(dbPool, ws, parseMsg.data);
      break;
    case 'getAllPurchaseRequest':
      purchaseAPI.allPurchaseRequest(dbPool, ws);
      break;
    case 'getAllUserRequest':
      userRequestAPI.allUserRequest(dbPool, ws);
      break;
    case 'getUserRequestByNumber':
      userRequestAPI.getUserRequestByNumber(dbPool, ws, parseMsg.data);
      break;
    case 'getUserRequestNewNumber':
      userRequestAPI.getUserRequestNewNumber(dbPool, ws);
      break;
    case 'getUserRequestService':
      userRequestAPI.getUserRequestService(dbPool, ws, parseMsg.data);
      break;
    case 'getUserRequestStatus':
      userRequestAPI.getUserRequestStatus(dbPool, ws, parseMsg.data);
      break;
    case 'getUserRequestPriority':
      userRequestAPI.getUserRequestPriority(dbPool, ws, parseMsg.data);
      break;
    case 'getUserRequestAttachment':
      userRequestAPI.getUserRequestAttachment(dbPool, ws, parseMsg.data);
      break;
    case 'getDepartment':
      userRequestAPI.getDepartment(dbPool, ws, parseMsg.data);
      break;
    case 'getEmployeeByParentDepartment':
      userRequestAPI.getEmployeeByParentDepartment(dbPool, ws, parseMsg.data);
      break;
    case 'saveNewUserRequest':
      userRequestAPI.saveNewUserRequest(dbPool, parseMsg.data, wss);
      break;
    case 'updateUserRequestStatus':
      userRequestAPI.updateUserRequestStatus(dbPool, parseMsg.data, ws, wss);
      break;
    case 'getUserRequestLifeCycle':
      userRequestAPI.getUserRequestLifeCycle(dbPool, ws, parseMsg.data);
      break;
    default:
      break;
  }
}
