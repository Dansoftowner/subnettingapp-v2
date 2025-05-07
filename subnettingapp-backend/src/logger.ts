import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  silent: process.env.NODE_ENV === 'test', // Disable logging in test environment
  transports: [new winston.transports.Console()],
});
