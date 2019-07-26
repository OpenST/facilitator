import winston from 'winston';

const { MOSAIC_FACILITATOR_LOG_LEVEL } = process.env;
export default winston.createLogger({
  level: MOSAIC_FACILITATOR_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
  ),
  defaultMeta: { service: 'facilitator' },
  transports: [new winston.transports.Console()],
  exceptionHandlers: [new winston.transports.Console()],
});
