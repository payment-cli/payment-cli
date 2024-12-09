import { readFileSync } from "fs";
import { resolve, join } from "path";

import { PackageInfo } from "@/types";

/**
 * Retrieves the package information from the `package.json` file.
 *
 * @returns {PackageInfo} The parsed contents of the `package.json` file.
 */
export default function getPackageInfo(): PackageInfo {
  const __dirname = resolve();
  const packageJsonPath = join(__dirname, "/package.json");
  const packageJson = readFileSync(packageJsonPath, "utf-8");
  return JSON.parse(packageJson) as PackageInfo;
}
