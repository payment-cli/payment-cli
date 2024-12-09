import { logger } from "@/utils";

/**
 * Handles errors by logging the error message and exiting the process.
 *
 * @param error - The error to handle. Can be a string or an instance of Error.
 *
 * If the error is a string, it logs the error message and exits the process with code 0.
 * If the error is an instance of Error, it logs the error message and exits the process with code 0.
 * If the error is neither a string nor an instance of Error, it logs a generic error message and exits the process with code 0.
 */
export default function handleErrors(error: unknown) {
  if (typeof error === "string") {
    logger.error(error);
    process.exit(1);
  }

  if (error instanceof Error) {
    logger.error(error.message);
    process.exit(1);
  }

  logger.error("Something went wrong. Please try again.");
  process.exit(1);
}
