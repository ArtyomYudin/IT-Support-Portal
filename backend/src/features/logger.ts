/**
 * Модуль настройки логирования
 */

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

export const logger = createLogger({
  // format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), myFormat),
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    // colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`),
  ),
  defaultMeta: { service: 'itsupport-backend' },
  transports: [
    new transports.File({ filename: '/var/log/itsupport/error.log', level: 'error' }),
    new transports.File({ filename: '/var/log/itsupport/combined.log' }),
    // new transports.File(options.file_info),
  ],
  exitOnError: false,
});
