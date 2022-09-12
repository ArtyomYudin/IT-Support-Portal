import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { dbPool } from '../shared/db/db_pool';
import * as dbSelect from '../shared/db/db_select';
import * as dbInsert from '../shared/db/db_insert';

const imapConfig = {
  user: process.env.IMAP_USER as string,
  password: process.env.IMAP_PASSWORD as string,
  host: process.env.IMAP_HOST as string,
  port: process.env.IMAP_PORT as number | undefined,
  tls: false,
};

async function getUserRequestNewNumber(): Promise<any> {
  let newNumber = 0;
  await dbPool
    .getConnection()
    .then(conn => {
      conn.query(dbSelect.getUserRequestNewNumber).then(rows => {
        // eslint-disable-next-line prefer-destructuring
        newNumber = rows[0];
        console.log(newNumber);
      });
      conn.release(); // release to pool
    })
    .catch(err => {
      console.log(`not connected due to error: ${err}`);
    });
  return newNumber;
}

export const getEmails = () => {
  console.log(process.env.IMAP_TLS);
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
          try {
            const f = imap.fetch(results, { bodies: '' });
            f.on('message', msg => {
              msg.on('body', stream => {
                simpleParser(stream, async (er, parsed) => {
                  // const {from, subject, textAsHtml, text} = parsed;
                  // console.log(parsed);
                  getUserRequestNewNumber().then((e: any) => {
                    console.log(e);
                  });
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
