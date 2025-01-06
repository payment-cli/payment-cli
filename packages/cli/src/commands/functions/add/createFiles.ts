import prompts from "prompts";
import { existsSync } from "fs";
import { relative, resolve } from "path";

import { logger, spinner } from "@/utils";
import { RegistryItemType } from "@/commands/types";
import { resolveDir } from "@/commands/utils";
import { writeFile } from "fs/promises";

/**
 * Creates files based on the provided registry items.
 * 
 * @param files - An array of registry items containing file information.
 * @param options - Optional settings for file creation.
 * @param options.overwrite - Whether to overwrite existing files.
 * 
 * @returns A promise that resolves when the files have been created.
 * 
 * @remarks
 * If a file already exists and the `overwrite` option is not set to true, 
 * the user will be prompted to confirm whether to overwrite the file.
 * 
 * @example
 * ```typescript
 * const files = [
 *   { path: 'example.txt', content: 'Hello, world!' }
 * ];
 * await createFiles(files, { overwrite: true });
 * ```
 */
export default async function createFiles(
  files: RegistryItemType["files"],
  options?: {
    overwrite?: boolean
  }
): Promise<void> {
  if (!files) return;

  const __dirname = resolve();
  const filesCreatedSpinner = spinner({
    text: 'Creating files',
  })?.start()

  const filesSkipped: string[] = [];
  for (const file of files) {
    if (!file.content) continue

    const targetPath = await resolveDir(file)
    const newFilePath = `${targetPath}/${file.path}`;

    if (existsSync(newFilePath) && !options?.overwrite) {
      filesCreatedSpinner.stop();
      const { overwrite } = await prompts({
        type: "confirm",
        name: "overwrite",
        message: `Files already exist for ${file.path}. Overwrite?`,
        initial: false,
      });

      if (!overwrite) {
        filesSkipped.push(relative(__dirname, newFilePath));
        continue;
      }

      filesCreatedSpinner.start()
    }

    await writeFile(newFilePath, file.content, "utf-8");
  }

  if (filesSkipped.length) {
    spinner({ 
      text: `Skipped ${filesSkipped.length} ${filesSkipped.length === 1 ? "file" : "files"}:`
    })?.info()
    for (const file of filesSkipped) {
      logger.log({
        level: "info",
        message: `  - ${file}`,
      })
    }
  }

  filesCreatedSpinner?.succeed()
}
