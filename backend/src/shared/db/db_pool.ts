import mariadb from 'mariadb';

export const dbPool = mariadb.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_BASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 50,
  // acquireTimeout: 60000,
  // connectTimeout: 60000,
});
