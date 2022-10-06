import { Pool } from 'mariadb';
import { Server, WebSocket } from 'ws';
import fs, { existsSync } from 'fs';
import * as dbSelect from '../shared/db/db_select';
import * as dbInsert from '../shared/db/db_insert';
import * as dbUpdate from '../shared/db/db_update';
import * as dbDelete from '../shared/db/db_delete';
import { sendEmailNotification } from './smtp-client';
import { logger } from './logger';

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
  /*
  const matches = dataString.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
  const response: any = {};
  if (matches?.length !== 3) {
    return new Error('Invalid input string');
  }
  // eslint-disable-next-line prefer-destructuring
  response.type = matches[1];
  logger.info(response.type);
  response.data = Buffer.from(matches[2], 'base64');
*/
  const response: any = {};
  const base64ContentArray = dataString.split(',');
  // eslint-disable-next-line prefer-destructuring
  response.type = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0];
  const base64Data = base64ContentArray[1];

  response.data = Buffer.from(base64Data, 'base64');
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
    ws.send(
      JSON.stringify({
        event: 'event_filtered_employee',
        data: filteredEmployeeArray,
      }),
    );
  } catch (error) {
    logger.error(`getFilteredEmployee - ${error}`);
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
    logger.error(`getEmployeeByUPN - ${error}`);
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
    ws.send(
      JSON.stringify({
        event: 'event_employee_by_parent_department',
        data: employeeByParentDepartment,
      }),
    );
  } catch (error) {
    logger.error(`getEmployeeByParentDepartment - ${error}`);
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
        status: { id: row.statusId, name: row.statusName, icon: row.statusIcon },
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
    logger.error(`allUserRequest - ${error}`);
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
        status: { id: row.statusId, name: row.statusName, icon: row.statusIcon },
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
    logger.error(`getUserRequestByNumber - ${error}`);
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
    // logger.info(newNumber);
    ws.send(
      JSON.stringify({
        event: 'event_user_request_new_number',
        data: newNumber,
      }),
    );
  } catch (error) {
    logger.error(`getUserRequestNewNumber - ${error}`);
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
    ws.send(
      JSON.stringify({
        event: 'event_user_request_service',
        data: userRequestServiceArray,
      }),
    );
  } catch (error) {
    logger.error(`getUserRequestService - ${error}`);
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
    ws.send(
      JSON.stringify({
        event: 'event_user_request_status',
        data: userRequestStatusArray,
      }),
    );
  } catch (error) {
    logger.error(`getUserRequestStatus - ${error}`);
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

    ws.send(
      JSON.stringify({
        event: 'event_user_request_priority',
        data: userRequestPriorityArray,
      }),
    );
  } catch (error) {
    logger.error(`getUserRequestPriority - ${error}`);
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

    ws.send(
      JSON.stringify({
        event: 'event_department',
        data: departmentArray,
      }),
    );
  } catch (error) {
    logger.error(`not connected due to error: ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getUserRequestAttachment(dbPool: Pool, ws: WebSocket, value: any): Promise<void> {
  const userRequestAttachmentArray: any[] = [];
  if (!Object.prototype.hasOwnProperty.call(value, 'fileName')) {
    let conn;
    try {
      conn = await dbPool.getConnection();
      const rows = await conn.query(dbSelect.getUserRequestAttachment(value.requestNumber));
      rows.forEach(async (row: any, i: number) => {
        userRequestAttachmentArray[i] = { id: row.id, fileName: row.fileName, fileType: row.fileType, filePath: row.filePath };
      });
      ws.send(
        JSON.stringify({
          event: 'event_user_request_attachment',
          data: userRequestAttachmentArray,
        }),
      );
    } catch (error) {
      logger.error(`getUserRequestAttachment - ${error}`);
    } finally {
      if (conn) conn.release();
    }
  } else if (existsSync(`${process.env.USER_REQUEST_ATTACHMENTS_PATH}/user_request/${value.requestNumber}`)) {
    fs.readFile(`${process.env.USER_REQUEST_ATTACHMENTS_PATH}/${value.filePath}/${value.fileName}`, (error, data) => {
      // console.log(`data:${value.FileType};base64,${data.toString('base64')}`);
      ws.send(
        JSON.stringify({
          event: 'event_user_request_attachment_base64',
          // data: `data:${value.fileType};base64,${data.toString('base64')}`,
          data: data.toString('base64'),
        }),
      );
    });
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
        value.executorId,
        value.serviceId,
        value.topic,
        value.description,
        value.statusId,
        value.priorityId,
        value.deadline,
      ),
    );
    if (!existsSync(`${process.env.USER_REQUEST_ATTACHMENTS_PATH}/user_request/${value.requestNumber}`) && value.attachments.length > 0) {
      fs.mkdir(`${process.env.USER_REQUEST_ATTACHMENTS_PATH}/user_request/${value.requestNumber}`, { recursive: true }, e => {
        if (!e) {
          value.attachments.forEach((attachment: any) => {
            fs.writeFile(
              `${process.env.USER_REQUEST_ATTACHMENTS_PATH}/user_request/${value.requestNumber}/${attachment.name}`,
              decodeBase64(attachment.data).data,
              error => {
                if (error) {
                  logger.error(`saveNewUserRequest - ${error}`);
                } else {
                  conn.query(
                    dbInsert.insertUserRequestAttachment(
                      value.requestNumber,
                      attachment.name,
                      attachment.size,
                      attachment.type,
                      `user_request/${value.requestNumber}`,
                    ),
                  );
                  logger.info('saveNewUserRequest - write file');
                }
              },
            );
          });
        } else {
          logger.error(`saveNewUserRequest - ${e}`);
          throw e;
        }
      });
    }
    allUserRequest(dbPool, null, wss);
    logger.info('New User Request create!');
    sendEmailNotification({
      subject: 'Тест',
      textAsHTML: `
              <html>
                <body style="word-wrap: break-word; -webkit-nbsp-mode: space" dir="auto">
                    <table cellspacing="0" cellpadding="0" style="border-collapse: collapse">
                        <tbody>
                            <tr>
                                <td
                                    valign="top"
                                    style="
                                        width: 120px;
                                        height: 14px;
                                        border-style: solid;
                                        border-width: 1px 1px 1px 1px;
                                        border-color: #808080 #808080 #808080 #808080;
                                        padding: 4px 4px 4px 4px;
                                    "
                                >
                                    <div style="margin: 0px">Тема</div>
                                </td>
                                <td
                                    valign="top"
                                    style="
                                        width: 330px;
                                        height: 14px;
                                        border-style: solid;
                                        border-width: 1px 1px 1px 1px;
                                        border-color: #808080 #808080 #808080 #808080;
                                        padding: 4px 4px 4px 4px;
                                    "
                                >
                                    <div style="margin: 0px; font-stretch: normal; font-size: 12px; line-height: normal; min-height: 14px"><br />
                                    ${value.topic}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </body>
              </html>`,
    });
  } catch (error) {
    logger.error(`saveNewUserRequest - ${error}`);
  } finally {
    if (conn) conn.release();
  }
  return response;
}

export async function getUserRequestLifeCycle(dbPool: Pool, ws: WebSocket, value: string): Promise<void> {
  let conn: any;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestLifeCycle(value));
    const requestLifeCycle = rows.map(async (row: { employee: any; eventDate: any; eventType: any; eventValue: any }) => {
      let eventName = row.eventValue;
      if (row.eventType === 'status') {
        eventName = await conn.query(dbSelect.getUserRequestStatus(row.eventValue as number));
        eventName = eventName[0].name;
      }
      if (row.eventType === 'delegate') {
        eventName = await conn.query(dbSelect.getEmployeeById(row.eventValue as number));
        eventName = eventName[0].displayName;
      }
      return {
        employee: row.employee,
        eventDate: row.eventDate,
        eventType: row.eventType,
        eventValue: eventName,
      };
    });

    ws.send(
      JSON.stringify({
        event: 'event_user_request_life_cycle',
        data: await Promise.all(requestLifeCycle),
      }),
    );
  } catch (error) {
    logger.error(`getUserRequestLifeCycle - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function updateUserRequest(dbPool: Pool, value: any, ws: WebSocket, wss: Server<WebSocket>): Promise<any> {
  let conn: any;
  let response;
  try {
    conn = await dbPool.getConnection();
    Object.keys(value.newData).forEach(async key => {
      if (key === 'status') {
        await conn.query(dbUpdate.updateUserRequestStatus(value.newData[key], value.requestNumber));
      }
      if (key === 'delegate') {
        await conn.query(dbUpdate.updateUserRequestExecutor(value.newData[key], value.requestNumber));
      }
      await conn
        .query(
          dbInsert.insertUserRequestLifeCycle(value.requestNumber, value.employeeId, changeDateFormat(new Date()), key, value.newData[key]),
        )
        .then(getUserRequestLifeCycle(dbPool, ws, value.requestNumber));
    });

    /*
    if (value.newData.statusId) {
      response = await conn.query(dbUpdate.updateUserRequestStatus(value.newData.statusId, value.requestNumber));
      await conn.query(
        dbInsert.insertUserRequestLifeCycle(
          value.requestNumber,
          value.employeeId,
          changeDateFormat(new Date()),
          'status',
          value.newData.statusId,
        ),
      );
    }
    if (value.newData.comment) {
      await conn.query(
        dbInsert.insertUserRequestLifeCycle(
          value.requestNumber,
          value.employeeId,
          changeDateFormat(new Date()),
          'comment',
          value.newData.comment,
        ),
      );
    }
    */
    allUserRequest(dbPool, null, wss);
    getUserRequestByNumber(dbPool, ws, value.requestNumber);
    // getUserRequestLifeCycle(dbPool, ws, value.requestNumber);
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
    logger.error(`updateUserRequestStatus - ${error}`);
  } finally {
    if (conn) conn.release();
  }
  return response;
}

export async function deleteUserRequest(dbPool: Pool, value: any, wss: Server<WebSocket>): Promise<any> {
  let conn: any;
  try {
    conn = await dbPool.getConnection();
    await conn.query(dbDelete.deleteUserRequest(value.toString()));
    value.forEach((card: any) => {
      const attachPath = `${process.env.USER_REQUEST_ATTACHMENTS_PATH}/user_request/${card}`;
      if (existsSync(attachPath)) {
        fs.rmSync(attachPath, { recursive: true, force: true });
      }
    });
  } catch (error) {
    logger.error(`deleteUserRequest - ${error}`);
  } finally {
    if (conn) conn.release();
  }
  allUserRequest(dbPool, null, wss);
}

export function init(dbPool: Pool, ws: WebSocket) {
  allUserRequest(dbPool, ws);
}
