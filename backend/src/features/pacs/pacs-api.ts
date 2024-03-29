import { Pool, PoolConnection } from 'mariadb';
import { Server, WebSocket } from 'ws';
import { TLSSocket } from 'node:tls';
import { logger } from '../logger';
import * as dbSelect from '../../shared/db/db_select';
import * as dbInsert from '../../shared/db/db_insert';
import * as pacsRequest from './pacs-create-json';
import { createRequestJSON } from './pacs-create-json';

const entranceAP = process.env.PACS_ENTRANCE_AP?.split(',').map(i => parseInt(i, 10));
const exitAP = process.env.PACS_EXIT_AP?.split(',').map(i => parseInt(i, 10));

// Посыл ответной комманды ping
export function sendPing(pingId: any, socket: TLSSocket) {
  const pingJSONData = JSON.stringify({
    Command: 'ping',
    Id: pingId,
    Version: 1,
  });
  socket.write(pacsRequest.createBuffer(pingJSONData));
}

async function getEventCurrentDay(conn: PoolConnection) {
  const pacsEventCurrentDayArray: any[] = [];
  try {
    const eventCurrentDayRows = await conn.query(dbSelect.pacsEventCurrentDay);
    eventCurrentDayRows.forEach((row: any, i: number) => {
      pacsEventCurrentDayArray[i] = {
        displayName: row.displayName,
        eventDate: row.eventDate,
        accessPoint: row.accessPointName,
        pacsDisplayName: row.pacsDisplayName,
      };
    });
  } catch (error) {
    logger.error(`getEventCurrentDay - ${error}`);
  }
  return pacsEventCurrentDayArray;
}

async function getLastEvent(conn: PoolConnection, ownerId?: number | undefined) {
  const pacsLastEventArray: any[] = [];
  try {
    const lastEventRows = await conn.query(dbSelect.pacsEventLast(ownerId));
    lastEventRows.forEach((row: any, i: number) => {
      pacsLastEventArray[i] = {
        displayName: row.displayName,
        eventDate: row.eventDate,
        accessPoint: row.accessPointName,
        pacsDisplayName: row.pacsDisplayName,
        departmentId: row.departmentId,
      };
    });
  } catch (error) {
    logger.error(`getLastEvent - ${error}`);
  }
  return pacsLastEventArray;
}

export async function getPacsEvent(dbPool: Pool, wss: Server<WebSocket>, ws?: WebSocket) {
  let conn;
  try {
    conn = await dbPool.getConnection();
    const eventCurrentDay = await getEventCurrentDay(conn);
    const lastEvent = await getLastEvent(conn);

    if (ws) {
      ws.send(
        JSON.stringify({
          event: 'event_pacs_entry_exit',
          data: { results: eventCurrentDay, total: eventCurrentDay.length },
        }),
      );
      ws.send(
        JSON.stringify({
          event: 'event_pacs_last_event',
          data: { results: lastEvent, total: lastEvent.length },
        }),
      );
    } else {
      wss.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_pacs_entry_exit',
            data: { results: eventCurrentDay, total: eventCurrentDay.length },
          }),
        );
        client.send(
          JSON.stringify({
            event: 'event_pacs_last_event',
            data: { results: lastEvent, total: lastEvent.length },
          }),
        );
      });
    }
  } catch (error) {
    logger.error(`getPacsEvent - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

export async function getPacsEmployeeLastEvent(dbPool: Pool, ws: WebSocket, userPrincipalName: string) {
  let conn;
  try {
    conn = await dbPool.getConnection();
    const owner = await conn.query(dbSelect.getPacsOwnerId(userPrincipalName));
    const lastEvent = await getLastEvent(conn, owner[0].ownerId);
    ws.send(
      JSON.stringify({
        event: 'event_pacs_employee_last_event',
        data: lastEvent,
      }),
    );
  } catch (error) {
    logger.error(`getPacsEmployeeLastEvent - ${error}`);
  } finally {
    if (conn) conn.release();
  }
}

// Разбор событий от Revers API
export function parseEvent(dbPool: Pool, wss: Server<WebSocket>, data: any) {
  /*
  const resive = JSON.parse(data.toString());
  const apEntry = [1, 5, 16, 21, 27, 36, 39, 41, 43, 45, 47];
  const apExit = [2, 6, 17, 20, 28, 37, 40, 42, 44, 46, 48];
  const employee = [3, 4, 189, 190, 191, 192, 193, 194, 195, 332];
  const apServerRoom = [29, 38];
  const guestCardId = [
    230, 231, 235, 236, 239, 240, 241, 242, 244, 246, 247, 248, 249, 250, 251, 252, 256, 257, 258, 261, 262, 263, 264, 265, 266, 267, 268,
    269, 270, 280, 287, 291, 293, 295, 296, 298, 301,
  ];
  */
  const pacsEvent = JSON.parse(data.toString());

  // const pacsEventCurrentDayArray: any[] = [];
  // const pacsLastEventArray: any[] = [];

  pacsEvent.Data.forEach(async (item: any) => {
    if (item.EvCode === 1) {
      let conn;
      try {
        conn = await dbPool.getConnection();
        // console.log('Total connections: ', dbPool.totalConnections());
        // console.log('Active connections: ', dbPool.activeConnections());
        // console.log('Idle connections: ', dbPool.idleConnections());
        if (process.env.NODE_ENV === 'production') {
          await conn.query(
            dbInsert.inserPacsEvent(
              item.EvTime.replace(/(\d+).(\d+).(\d+)/, '$3-$2-$1'),
              item.EvAddr,
              item.EvUser,
              item.EvCard,
              item.EvCode,
            ),
          );
        }
        // const eventCurrentDayRows = await conn.query(dbSelect.pacsEventCurrentDay);
        // const lastEventRows = await conn.query(dbSelect.pacsEventLast);
        // eventCurrentDayRows.forEach((row: any, i: number) => {
        //  pacsEventCurrentDayArray[i] = {
        //    displayName: row.displayName,
        //    eventDate: row.eventDate,
        //    accessPoint: row.accessPointName,
        //    pacsDisplayName: row.pacsDisplayName,
        //  };
        // });
        // lastEventRows.forEach((row: any, i: number) => {
        //  pacsLastEventArray[i] = {
        //    displayName: row.displayName,
        //    eventDate: row.eventDate,
        //    accessPoint: row.accessPointName,
        //    pacsDisplayName: row.pacsDisplayName,
        //    departmentId: row.departmentId,
        // };
        // });

        await getPacsEvent(dbPool, wss);

        /*
        if (entranceAP?.indexOf(item.EvAddr) !== -1) {
          try {
            // console.log('Entrance !!!');
            // const allTenEntryRows = await dbSelect.dashboard.query(dbSelect.allTenEntry);
            wss.clients.forEach(client => {
              client.send(
                JSON.stringify({
                  event: 'event_pacs_entry_exit',
                  //      data: allTenEntryRows,
                }),
              );
            });
          } catch (error) {
            logger.error(`parseEvent - ${error}`);
          }
        }

        if (exitAP?.indexOf(item.EvAddr) !== -1) {
          // console.log('Exit  !!!');
        }
        */
      } catch (error) {
        logger.error(`parseEvent - ${error}`);
      } finally {
        if (conn) conn.release();
      }
    }
  });

  /*
  resive.Data.forEach(async item => {
    if (item.EvCode === 1) {
      const insertEventValue = [item.EvTime.replace(/(\d+).(\d+).(\d+)/, '$3-$2-$1'), item.EvCode, item.EvAddr, item.EvUser, item.EvCard];
      
      try {
        await dbConnect.dashboard.query(dbInsert.inserEvent, insertEventValue);
        if (apEntry.indexOf(item.EvAddr) !== -1) {
          try {
            const allTenEntryRows = await dbConnect.dashboard.query(dbSelect.allTenEntry);
            wss.clients.forEach(client => {
              client.send(
                JSON.stringify({
                  event: 'event_entry',
                  data: allTenEntryRows,
                }),
              );
            });
          } catch (error) {
            logger.error(error);
          }

          realOnTerritory(item.EvAddr);

          if (guestCardId.indexOf(item.EvUser) === -1) {
            try {
              const employeeTotalPerDayRows = await dbConnect.dashboard.query(dbSelect.employeeTotalPerDay);

              wss.clients.forEach(client => {
                client.send(
                  JSON.stringify({
                    event: 'event_employee_per_day',
                    data: employeeTotalPerDayRows.length,
                  }),
                );
              });
            } catch (error) {
              logger.error(error);
            }
          }
        }

        if (apExit.indexOf(item.EvAddr) !== -1) {
          try {
            const allTenExitRows = await dbConnect.dashboard.query(dbSelect.allTenExit);
            wss.clients.forEach(client => {
              client.send(
                JSON.stringify({
                  event: 'event_exit',
                  data: allTenExitRows,
                }),
              );
            });
          } catch (error) {
            logger.error(error);
          }
          realOnTerritory(item.EvAddr);
        }

        if (employee.indexOf(item.EvUser) !== -1) {
          try {
            const allEmployeeUCRows = await dbConnect.dashboard.query(dbSelect.allEmployeeUC);
            wss.clients.forEach(client => {
              client.send(
                JSON.stringify({
                  event: 'event_employeeuc',
                  data: allEmployeeUCRows,
                }),
              );
            });
          } catch (error) {
            logger.error(error);
          }
        }

        // отправка события срабатывания карточки доступа сотрудника

        if (item.EvUser !== 0) {
          try {
            const lastEmployeeRows = await dbConnect.dashboard.query(dbSelect.lastEmployee(item.EvUser));
            let lastEmployee = {};
            if (lastEmployeeRows.length === 1) {
              lastEmployee = {
                id: lastEmployeeRows[0].id,
                lastName: lastEmployeeRows[0].lname,
                firstName: lastEmployeeRows[0].fname,
                middleName: lastEmployeeRows[0].mname,
                photo: lastEmployeeRows[0].photo,
                apointName: lastEmployeeRows[0].apoint,
                timeStamp: lastEmployeeRows[0].tstamp,
              };
            }
            wss.clients.forEach(client => {
              client.send(
                JSON.stringify({
                  event: 'event_employee',
                  data: lastEmployee,
                }),
              );
            });
          } catch (error) {
            logger.error(error);
          }
        }

        if (apServerRoom.indexOf(item.EvAddr) !== -1) {
          try {
            const lastServerRoomEmployeeRows = await dbConnect.dashboard.query(dbSelect.lastServerRoomEmployee(item.EvUser));

            wss.clients.forEach(client => {
              client.send(
                JSON.stringify({
                  event: item.EvAddr === 29 ? 'event_server_room_1_employee' : 'event_server_room_2_employee',
                  data: lastServerRoomEmployeeRows[0],
                }),
              );
            });
          } catch (error) {
            logger.error(error);
          }
        }
      } catch (error) {
        logger.error(error);
      }
    }
  });
  */
}

// Передача запроса на выдачу или изьятие гостевой карты
export function sendExtJSON(reqBody: string, pacsSocket: TLSSocket, dbPool: Pool) {
  if (JSON.parse(reqBody).secret === 'Z3SN1AR6') {
    // const socketReq = initApiSocket();
    createRequestJSON(pacsSocket, dbPool, reqBody, false);
    // if (JSON.parse(reqBody).event === 'issue') guestPerDay();
    // if (/автомобиль/.test(JSON.parse(reqBody).pass_type)) {
    //  realCarOnTerritory();
    //  carTotalPerDay();
    // }
    pacsSocket.on('data', data => {
      try {
        const resive = JSON.parse(data.slice(4).toString());
        logger.info(resive);
        switch (resive.Command) {
          case 'addcard':
            if (resive.ErrCode === 9) {
              createRequestJSON(pacsSocket, dbPool, reqBody, true);
            } else pacsSocket.emit('end');
            break;
          case 'editcard':
            if (resive.ErrCode === 0 || resive.ErrCode === 10) pacsSocket.emit('end');
            break;
          case 'delcard':
            if (resive.ErrCode === 6) {
              createRequestJSON(pacsSocket, dbPool, reqBody, true);
            } else pacsSocket.emit('end');
            break;
          default:
            break;
        }
      } catch (e) {
        logger.error({ 'RESIVE ERROR: ': e });
      }
    });
    // pacsSocket.on('end', () => {
    //  pacsSocket.destroy();
    //  logger.info('Revers API web client disconnected from server');
    // });
  } else {
    logger.error('Not valid secret phrase');
  }
}
