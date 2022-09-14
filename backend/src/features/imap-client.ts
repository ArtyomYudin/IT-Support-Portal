import Imap from 'imap';
import { ParsedMail, simpleParser } from 'mailparser';
import { Server, WebSocket } from 'ws';
import { sendEmailNotification } from './email-sender';
import { dbPool } from '../shared/db/db_pool';
import * as dbSelect from '../shared/db/db_select';
import * as userRequestAPI from './user-request-api';

const imapConfig = {
  user: process.env.IMAP_USER as string,
  password: process.env.IMAP_PASSWORD as string,
  host: process.env.IMAP_HOST as string,
  port: process.env.IMAP_PORT as number | undefined,
  tls: true,
};

const executorIdList = [86, 129];
async function getUserRequestNewNumber(): Promise<string> {
  let conn;
  let newNumber;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getUserRequestNewNumber);
    newNumber = rows[0].newNumber;
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    // Close Connection
    if (conn) conn.release();
  }
  return newNumber.toString().padStart(6, 0);
}

async function getEmployeeByUPN(value: any): Promise<any> {
  let conn;
  let employeeByUPN;
  try {
    conn = await dbPool.getConnection();
    const rows = await conn.query(dbSelect.getEmployeeByUPN(value));
    employeeByUPN = rows;
  } catch (error) {
    console.log(`not connected due to error: ${error}`);
  } finally {
    // Close Connection
    if (conn) conn.release();
  }
  // console.log(employeeByUPN);
  return employeeByUPN[0];
}

async function createUserRequest(mail: ParsedMail, wss: Server<WebSocket>): Promise<boolean> {
  const userRequestAllData: {
    creationDate: any;
    changeDate: any;
    requestNumber: string;
    initiatorId: any;
    departmentId: number;
    executorId: number;
    serviceId: number;
    topic: string;
    description: string;
    statusId: number;
    priorityId: number;
    deadline: string;
    attachments: any[];
  } = {
    creationDate: new Date(),
    changeDate: new Date(),
    requestNumber: '',
    initiatorId: 0,
    departmentId: 0,
    executorId: 0,
    serviceId: 1,
    topic: '',
    description: '',
    statusId: 1,
    priorityId: 1,
    deadline: '',
    attachments: [],
  };

  try {
    const employee = await getEmployeeByUPN(mail.from?.value[0].address);
    // console.log(mail.from?.value[0].address);
    userRequestAllData.creationDate = mail.headers.get('date');
    userRequestAllData.changeDate = mail.headers.get('date');
    userRequestAllData.requestNumber = await getUserRequestNewNumber();
    userRequestAllData.initiatorId = employee.id;
    userRequestAllData.departmentId = employee.departmentId;
    userRequestAllData.executorId = executorIdList[Math.floor(Math.random() * executorIdList.length)];
    userRequestAllData.topic = mail.subject ? mail.subject : '';
    userRequestAllData.description = mail.text ? mail.text : '';
    userRequestAllData.priorityId = mail.headers.get('priority') === 'high' ? 2 : 1;
    userRequestAllData.deadline = new Date().toISOString().replace(/T.+/, '');

    const attachArray: any[] = [];
    mail.attachments.forEach((att: any) => {
      attachArray.push({
        name: att.filename,
        type: att.contentType,
        size: att.size,
        data: `data:${att.contentType};base64,${Buffer.from(att.content).toString('base64')}`,
      });
    });
    userRequestAllData.attachments = attachArray;
    // const att = `data:${mail.attachments[0].contentType};base64,${Buffer.from(mail.attachments[0].content).toString('base64')}`;
    await userRequestAPI.saveNewUserRequest(dbPool, userRequestAllData, wss);
    return true;
  } catch (error) {
    return false;
  }
}

export const getEmails = (wss: Server<WebSocket>) => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN'], (err, results) => {
          try {
            const f = imap.fetch(results, { bodies: '' });
            f.on('message', msg => {
              msg.on('body', stream => {
                simpleParser(stream, async (er, parsed) => {
                  // console.log(parsed);
                  createUserRequest(parsed, wss);
                });
              });
              msg.once('attributes', attrs => {
                const { uid } = attrs;
                imap.addFlags(uid, ['\\Seen'], () => {
                  // Mark the email as read after reading it
                  console.log('Marked as read!');
                });
              });
            });
            f.once('error', ex => {
              return Promise.reject(ex);
            });
            f.once('end', () => {
              console.log('Done fetching all messages!');
              imap.end();
            });
          } catch (e: any) {
            console.log(e.message);
            // sendEmailNotification({ subject: 'test' });
            // if (e.message === 'Nothing to fetch') {
            //  console.log('no mails fetched, temp directory not created');
            //  console.log('Read mail executor finished …..');

            // imap.end();
            // }
            imap.end();
          }
        });
      });
    });

    imap.once('error', (err: any) => {
      console.log(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred');
  }
};
