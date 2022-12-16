import mariadb from 'mariadb';

export const dbPool = mariadb.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_BASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 50,
  trace: process.env.NODE_ENV === 'development',
  // acquireTimeout: 10000,
  // connectTimeout: 10000,
});

if (process.env.NODE_ENV === 'development') {
  dbPool.on('acquire', connection => {
    console.log('Connection %d acquired', connection.threadId);
  });
  // dbPool.on('connection', connection => {
  //  connection.query('SET SESSION auto_increment_increment=1');
  // });
  dbPool.on('enqueue', () => {
    console.log('Waiting for available connection slot');
  });
  dbPool.on('release', connection => {
    console.log('Connection %d released', connection.threadId);
  });
}
