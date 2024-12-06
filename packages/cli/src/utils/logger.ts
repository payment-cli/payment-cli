import { createLogger, format, transports } from "winston";

/**
 * @description Logger instance configured with the following settings:
 * - Level: "info"
 * - Format: Combines colorization, timestamp, and custom printf format
 * - Transports: Outputs to console
 *
 * The logger outputs messages in the format: `${timestamp} ${level}: ${message}`
 */
export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [new transports.Console()],
});
