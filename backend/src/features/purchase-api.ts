import { Pool } from 'mariadb';
import { Server, WebSocket } from 'ws';
import { Blob } from 'buffer';
import fs from 'fs';
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

function base64ToBlob(dataURI: any) {
  console.log(dataURI);
  const byteString = Buffer.from(dataURI.split(',')[1], 'base64').toString();
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ia], { type: mimeString });
  return blob;
}

function decodeBase64(dataString: any) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }
  // response.type = matches[1];
  // response.data = Buffer.from(matches[2], 'base64');
  const response = Buffer.from(matches[2], 'base64').toString;
  return response;
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

export function getFilteredEmployee(dbPool: Pool, ws: WebSocket, value: string): void {
  const filteredEmployeeArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getFilteredEmployee(value)).then(rows => {
        rows.forEach((row: any, i: number) => {
          filteredEmployeeArray[i] = { id: row.id, displayName: row.displayName, departmentId: row.departmentId };
        });
        console.log(filteredEmployeeArray);
        ws.send(
          JSON.stringify({
            event: 'event_filtered_employee',
            data: filteredEmployeeArray,
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

export function allUserRequest(dbPool: Pool, ws: WebSocket): void {
  const allUserRequestArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.userRequestList).then(rows => {
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
            status: { id: row.status_id, name: row.statusName },
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
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getUserRequestService(dbPool: Pool, ws: WebSocket, value?: number): void {
  const userRequestServiceArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getUserRequestService(value)).then(rows => {
        rows.forEach((row: any, i: number) => {
          userRequestServiceArray[i] = { id: row.id, name: row.name };
        });
        console.log(userRequestServiceArray);
        ws.send(
          JSON.stringify({
            event: 'event_user_request_service',
            data: userRequestServiceArray,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getUserRequestStatus(dbPool: Pool, ws: WebSocket, value?: number): void {
  const userRequestStatusArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getUserRequestStatus(value)).then(rows => {
        rows.forEach((row: any, i: number) => {
          userRequestStatusArray[i] = { id: row.id, name: row.name };
        });
        console.log(userRequestStatusArray);
        ws.send(
          JSON.stringify({
            event: 'event_user_request_status',
            data: userRequestStatusArray,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getUserRequestPriority(dbPool: Pool, ws: WebSocket, value?: number): void {
  const userRequestPriorityArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getUserRequestPriority(value)).then(rows => {
        rows.forEach((row: any, i: number) => {
          userRequestPriorityArray[i] = { id: row.id, name: row.name };
        });
        console.log(userRequestPriorityArray);
        ws.send(
          JSON.stringify({
            event: 'event_user_request_priority',
            data: userRequestPriorityArray,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getDepartment(dbPool: Pool, ws: WebSocket, value?: number): void {
  const departmentArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getDepartment(value)).then(rows => {
        rows.forEach((row: any, i: number) => {
          departmentArray[i] = { id: row.id, name: row.name, parentName: row.parentDepartmentName };
        });
        console.log(departmentArray);
        ws.send(
          JSON.stringify({
            event: 'event_department',
            data: departmentArray,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export async function saveNewUserRequest(dbPool: Pool, ws: WebSocket, value: any): Promise<void> {
  // value.attachments.forEach((attachment: any) => {
  //  fs.writeFileSync(attachment.name, decodeBase64(attachment.data), {
  //    flag: 'w',
  //  });
  //  // conn.query(dbInsert.insertUserRequestAttachment(value.requestNumber, base64ToBlob(attachment.data)));
  // });

  dbPool
    .getConnection()
    .then(conn => {
      try {
        conn.query(
          dbInsert.insertUserRequest(
            changeDateFormat(new Date()),
            changeDateFormat(new Date()),
            value.requestNumber,
            value.initiatorId,
            value.departmentId,
            value.executorId,
            value.serviceId,
            value.topic,
            value.description,
            value.statusId,
            value.priorityId,
            value.deadline,
          ),
        );
        // value.attachments.forEach((attachment: any) => {
        //   fs.writeFile(attachment.name, attachment.data);
        //   // conn.query(dbInsert.insertUserRequestAttachment(value.requestNumber, base64ToBlob(attachment.data)));
        // });
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
