import { PackageInfo } from "@/types";
import fs from "fs";
import path from "path";

// export const getPackageInfo = () => {
//   return require("./package.json") as PackageInfo;
// };
export const getPackageInfo = () => {
  const packageJsonPath = path.resolve("./", "package.json");
  const packageJson = fs.readFileSync(packageJsonPath, "utf-8");
  return JSON.parse(packageJson) as PackageInfo;
};
