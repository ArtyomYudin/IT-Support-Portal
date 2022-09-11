import Imap from 'imap';
import { simpleParser } from 'mailparser';

const imapConfig = {
  user: process.env.IMAP_USER as string,
  password: process.env.IMAP_PASSWORD as string,
  host: process.env.IMAP_HOST as string,
  port: 143,
  tls: false,
};

export const getEmails = () => {
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
                  console.log(parsed);
                  /* Make API call to save the data
                           Save the retrieved data into a database.
                           E.t.c
                        */
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
