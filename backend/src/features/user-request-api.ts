import { Pool, PoolConnection } from 'mariadb';
import { Server, WebSocket } from 'ws';
import fs, { existsSync } from 'fs';
import * as dbSelect from '../shared/db/db_select';
import * as dbInsert from '../shared/db/db_insert';
import * as dbUpdate from '../shared/db/db_update';

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

export async function getFilteredEmployee(dbPool: Pool, ws: WebSocket, value: string): Promise<void> {
  const filteredEmployeeArray: any[] = [];
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getFilteredEmployee(value));
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
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getEmployeeByUPN(dbPool: Pool, ws: WebSocket, value: string): Promise<void> {
  let employeeByUPN: any = {};
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getEmployeeByUPN(value));
    rows.forEach((row: any) => {
      employeeByUPN = row;
    });
    ws.send(
      JSON.stringify({
        event: 'event_employee_by_upn',
        data: employeeByUPN,
      }),
    );
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getEmployeeByParentDepartment(dbPool: Pool, ws: WebSocket, value: number): Promise<void> {
  const employeeByParentDepartment: any[] = [];
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getEmployeeByParentDepartment(value));
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
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function allUserRequest(dbPool: Pool, ws: WebSocket | null, wss?: Server<WebSocket>): Promise<void> {
  let conn;
  const allUserRequestArray: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.userRequestList);
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
      wss?.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_user_request_all',
            data: { results: allUserRequestArray, total: allUserRequestArray.length },
          }),
        );
      });
    }
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserRequestByNumber(dbPool: Pool, ws: WebSocket, value: string): Promise<void> {
  let conn;
  let userRequest: any = {};
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.userRequestbyNumber(value));
    rows.forEach((row: any) => {
      userRequest = {
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
    ws.send(
      JSON.stringify({
        event: 'event_user_request_by_number',
        data: userRequest,
      }),
    );
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserRequestNewNumber(dbPool: Pool, ws: WebSocket): Promise<void> {
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestNewNumber);
    const newNumber = rows[0];
    console.log(newNumber);
    ws.send(
      JSON.stringify({
        event: 'event_user_request_new_number',
        data: newNumber,
      }),
    );
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}
export async function getUserRequestService(dbPool: Pool, ws: WebSocket, value?: number): Promise<void> {
  const userRequestServiceArray: any[] = [];
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestService(value));
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
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserRequestStatus(dbPool: Pool, ws: WebSocket, value?: number): Promise<void> {
  const userRequestStatusArray: any[] = [];
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestStatus(value));
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
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserRequestPriority(dbPool: Pool, ws: WebSocket, value?: number): Promise<void> {
  const userRequestPriorityArray: any[] = [];
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestPriority(value));
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
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getDepartment(dbPool: Pool, ws: WebSocket, value?: number): Promise<void> {
  const departmentArray: any[] = [];
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getDepartment(value));
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
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserRequestAttachment(dbPool: Pool, ws: WebSocket, value?: number): Promise<void> {
  const userRequestAttachmentArray: any[] = [];
  let conn;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestAttachment(value));
    rows.forEach(async (row: any, i: number) => {
      userRequestAttachmentArray[i] = { id: row.id, fileName: row.fileName };
    });
    ws.send(
      JSON.stringify({
        event: 'event_user_request_attachment',
        data: userRequestAttachmentArray,
      }),
    );
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
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
    if (conn) conn.release();
  }
  return response;
}

export async function updateUserRequestStatus(dbPool: Pool, value: any, ws: WebSocket, wss: Server<WebSocket>): Promise<any> {
  let conn: any;
  let response;
  try {
    conn = await dbPool.getConnection();
    response = await conn.query(dbUpdate.updateUserRequestStatus(value.statusId, value.requestNumber));
    await conn.query(
      dbInsert.insertUserRequestLifeCycle(value.requestNumber, value.employeeId, changeDateFormat(new Date()), 'status', value.statusId),
    );
    allUserRequest(dbPool, null, wss);
    getUserRequestByNumber(dbPool, ws, value.requestNumber);
    ws.send(
      JSON.stringify({
        event: 'event_notify',
        data: { event_type: 'userRequestStatusChange', event_status: 'success', event_message: 'Статус заявки изменен' },
      }),
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        event: 'event_notify',
        data: { event_type: 'userRequestStatusChange', event_status: 'error', event_message: 'Невозможно изменить статус заявки' },
      }),
    );
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
  return response;
}

export async function getUserRequestLifeCycle(dbPool: Pool, ws: WebSocket, value: string): Promise<void> {
  let conn: any;
  const eventValue = '';
  const requestLifeCycle: any[] = [];
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestLifeCycle(value));
    rows.forEach((row: any, i: number) => {
      // f (row.eventType === 'status') {
      //  await conn.query(dbSelect.getUserRequestStatus(row.eventValue as number)).then((status: any) => {
      //    eventValue = status[0].name;
      //  });
      // console.log(status[0].name);
      // }
      requestLifeCycle[i] = {
        employee: row.employee,
        eventDate: row.eventDate,
        eventType: row.eventType,
        eventValue: row.eventValue,
      };
      // console.log(row);
    });
    console.log(requestLifeCycle);
    ws.send(
      JSON.stringify({
        event: 'event_user_request_life_cycle',
        data: requestLifeCycle[0],
      }),
    );
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}
export function init(dbPool: Pool, wss: Server<WebSocket>, ws: WebSocket) {
  allUserRequest(dbPool, ws, wss);
}
