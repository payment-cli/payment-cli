import { resolve } from "path";
import { glob } from "glob";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";

import { RegistryItemFileType } from "@/commands/types";

export default async function resolveDir(file: RegistryItemFileType): Promise<string> {
  const __dirname = resolve();

  const [
    configFiles,
    isSrcDir,
  ] = await Promise.all([
    glob(
      "**/{next,vite}.config.*",
      {
        cwd: __dirname,
      },
    ),
    existsSync(resolve(__dirname, 'src'))
   ,
  ])

  const componentType = file.type.split(":");
  const folderPath = componentType[0];
  const componentMain = componentType[1];

  const basePath = isSrcDir ? `./src/${folderPath}` : `./components/${folderPath}`;
  const targetPath = componentMain === 'index' ? basePath : `${basePath}/${componentMain}`;
  if (!existsSync(targetPath)) {
    await mkdir(targetPath, { recursive: true });
  }

  return targetPath;
}