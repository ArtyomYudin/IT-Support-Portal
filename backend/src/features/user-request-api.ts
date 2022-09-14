import { Pool } from 'mariadb';
import { Server, WebSocket } from 'ws';
import fs, { existsSync } from 'fs';
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

function decodeBase64(dataString: any) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response: any = {};
  if (matches?.length !== 3) {
    return new Error('Invalid input string');
  }
  // eslint-disable-next-line prefer-destructuring
  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
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

export function allUserRequest(dbPool: Pool, ws?: WebSocket | null, wss?: any): void {
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
            status: { id: row.statusId, name: row.statusName },
            priority: { id: row.priority_id, name: row.priorityName, color: row.priorityColor },
            deadline: row.deadline,
          };
        });
        if (ws) {
          ws.send(
            JSON.stringify({
              event: 'event_user_request_all',
              data: { results: allUserRequestArray, total: allUserRequestArray.length },
            }),
          );
        } else {
          wss.clients.forEach((client: any) => {
            client.send(
              JSON.stringify({
                event: 'event_user_request_all',
                data: { results: allUserRequestArray, total: allUserRequestArray.length },
              }),
            );
          });
        }
      });
      // ws.send(
      //   JSON.stringify({
      //     event: 'event_notify',
      //     data: { type: 'info', error: false, event: 'All read!' },
      //   }),
      // );
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export function getUserRequestNewNumber(dbPool: Pool, ws: WebSocket): void {
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getUserRequestNewNumber).then(rows => {
        const newNumber = rows[0];
        console.log(newNumber);
        ws.send(
          JSON.stringify({
            event: 'event_user_request_new_number',
            data: newNumber,
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

export function getUserRequestAttachment(dbPool: Pool, ws: WebSocket, value?: number): void {
  const userRequestAttachmentArray: any[] = [];
  dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getUserRequestAttachment(value)).then(rows => {
        rows.forEach(async (row: any, i: number) => {
          userRequestAttachmentArray[i] = { id: row.id, fileName: row.fileName };
        });
        ws.send(
          JSON.stringify({
            event: 'event_user_request_attachment',
            data: userRequestAttachmentArray,
          }),
        );
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
}

export async function saveNewUserRequest(dbPool: Pool, value: any, wss: Server<WebSocket>): Promise<any> {
  let conn: any;
  let response;
  try {
    conn = await dbPool.getConnection();
    response = await conn.query(
      dbInsert.insertUserRequest(
        value.creationDate ? changeDateFormat(value.creationDate) : changeDateFormat(new Date()),
        value.changeDate ? changeDateFormat(value.changeDate) : changeDateFormat(new Date()),
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
    if (!existsSync(value.requestNumber) && value.attachments.length > 0) {
      fs.mkdir(`${process.env.USER_REQUEST_ATTACHMENTS_PATH}/${value.requestNumber}`, { recursive: true }, e => {
        if (!e) {
          value.attachments.forEach((attachment: any) => {
            // console.log(attachment.data);
            fs.writeFile(
              `${process.env.USER_REQUEST_ATTACHMENTS_PATH}/${value.requestNumber}/${attachment.name}`,
              decodeBase64(attachment.data).data,
              error => {
                if (error) {
                  console.log('write error');
                } else {
                  conn.query(
                    dbInsert.insertUserRequestAttachment(
                      value.requestNumber,
                      attachment.name,
                      attachment.size,
                      attachment.type,
                      `${process.env.USER_REQUEST_ATTACHMENTS_PATH}/${value.requestNumber}`,
                    ),
                  );
                  console.log('write file');
                }
              },
            );
          });
        } else {
          console.log('Exception while creating new directory....');
          throw e;
        }
      });
    }
    allUserRequest(dbPool, null, wss);
    console.log('Request create!');
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    // Close Connection
    if (conn) conn.release();
  }
  return response;
}

export function init(dbPool: Pool, wss: Server<WebSocket>, ws: WebSocket) {
  allUserRequest(dbPool, ws);
}
