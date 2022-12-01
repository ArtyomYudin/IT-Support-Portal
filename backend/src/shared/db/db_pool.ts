import mariadb from 'mariadb';

export const dbPool = mariadb.createPool({
  host: process.env.DB_HOST,
  database: 'itsupport',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 25,
  // acquireTimeout: 60000,
  // connectTimeout: 60000,
});
