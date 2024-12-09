import { join, resolve } from "path";

/**
 * Generates an absolute path by joining the current directory with the specified file name.
 *
 * @param {string} file The name of the file to generate the path for.
 * @returns The absolute path to the specified file.
 */
export default function getFilePath(file: string): string {
  const __dirname = resolve();
  return join(__dirname, `/${file}`);
};
