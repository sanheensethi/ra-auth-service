import { createLogger, format, LoggerOptions, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "../../config/v1/config";

// Define the options for the logger
const options: LoggerOptions = {
  level: config['logLevel'] || 'info', // Default log level
  format: format.combine(
    format.timestamp({
      format: config['logsTimeFormat'] || 'YYYY-MM-DDTHH:mm:ssZ' // ISO 8601 format with timezone
    }),
    format.printf(({ timestamp, level, message }: any) => {
      return JSON.stringify({
        timestamp: timestamp,
        level: level,
        message: message
      });
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: config['logFileName'],
      datePattern: config['logsFilenameDatePattern'] || 'YYYY-MM-DD',
      maxSize: config['logsMaxSizePerFile'] || '30m',
      maxFiles: config['logsMaxFiles'] || '14d',
      format: format.combine(
        format.uncolorize(),
        format.json() // Log in JSON format for easy parsing
      )
    }),

    // Console logs
    new transports.Console({
      format: format.combine(
        format.colorize(), // Pretty colors for console
        format.simple()    // Simple output format
      )
    })
  ]
};

// Create the logger with the defined options
const logger = createLogger(options);
export default logger;
