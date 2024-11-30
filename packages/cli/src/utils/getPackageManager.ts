import { existsSync, readFileSync, watchFile } from "fs";
import { configPath } from "./getPathFile";
import { PMType } from "@/types";

export const getPackageManager = (): PMType => {
  if (existsSync(configPath("yarn.lock"))) {
    return "yarn";
  }
  if (existsSync(configPath("bun.lockb"))) {
    return "bun";
  }
  if (existsSync(configPath("pnpm-lock.yaml"))) {
    return "pnpm";
  }
  return "npm";
};
