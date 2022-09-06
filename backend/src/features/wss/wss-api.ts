import { Pool } from 'mariadb';
import { WebSocket } from 'ws';

import * as purchaseAPI from '../purchase-api';

export function wsParseMessage(dbPool: Pool, ws: WebSocket, msg: any): void {
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
      console.log(`Connection test ${parseMsg.data}`);
      purchaseAPI.getFilteredEmployee(dbPool, ws, parseMsg.data);
      break;
    case 'getFilteredRequestInitiator':
      console.log(`Request Initiator ${parseMsg.data}`);
      purchaseAPI.getFilteredEmployee(dbPool, ws, parseMsg.data);
      break;
    case 'purchaseRequestInit':
      purchaseAPI.getPurchaseRequestInitInfo(dbPool, ws, parseMsg.data);
      console.log(parseMsg.data);
      break;
    case 'purchaseRequestAsDraft':
      purchaseAPI.savePurcheseRequest(dbPool, ws, parseMsg.data);
      console.log(parseMsg.data);
      break;
    case 'getAllPurchaseRequest':
      purchaseAPI.allPurchaseRequest(dbPool, ws);
      break;
    case 'getAllUserRequest':
      purchaseAPI.allUserRequest(dbPool, ws);
      break;
    case 'getUserRequestService':
      console.log(`Service ${parseMsg.data}`);
      purchaseAPI.getUserRequestService(dbPool, ws, parseMsg.data);
      break;
    case 'getUserRequestStatus':
      console.log(`Status ${parseMsg.data}`);
      purchaseAPI.getUserRequestStatus(dbPool, ws, parseMsg.data);
      break;
    case 'getUserRequestPriority':
      console.log(`Priority ${parseMsg.data}`);
      purchaseAPI.getUserRequestPriority(dbPool, ws, parseMsg.data);
      break;
    // case 'getUserRequestAttachment':
    //  console.log(`Priority ${parseMsg.data}`);
    //  purchaseAPI.getUserRequestAttachment(dbPool, ws, parseMsg.data);
    //  break;
    case 'getDepartment':
      console.log(`Service ${parseMsg.data}`);
      purchaseAPI.getDepartment(dbPool, ws, parseMsg.data);
      break;
    case 'getEmployeeByParentDepartment':
      console.log(`Connection test ${parseMsg.data}`);
      purchaseAPI.getEmployeeByParentDepartment(dbPool, ws, parseMsg.data);
      break;
    case 'saveNewUserRequest':
      console.log(`Service ${parseMsg.data}`);
      purchaseAPI.saveNewUserRequest(dbPool, ws, parseMsg.data);
      break;
    default:
      break;
  }
}
