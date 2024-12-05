import { existsSync } from "fs";

import { PMType } from "@/types";
import { getFilePath } from "@/utils";

/**
 * Determines the package manager used in the project by checking for the existence of specific lock files.
 *
 * @returns {PMType} The type of package manager detected. Possible values are:
 * - "yarn" if a `yarn.lock` file is found.
 * - "bun" if a `bun.lockb` file is found.
 * - "pnpm" if a `pnpm-lock.yaml` file is found.
 * - "npm" if none of the above lock files are found.
 */
export default function getPackageManager(): PMType {  
  if (existsSync(getFilePath("yarn.lock"))) {
    return "yarn";
  }
  if (existsSync(getFilePath("bun.lockb"))) {
    return "bun";
  }
  if (existsSync(getFilePath("pnpm-lock.yaml"))) {
    return "pnpm";
  }
  return "npm";
};
