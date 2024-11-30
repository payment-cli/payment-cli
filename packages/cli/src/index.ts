import { Command } from "commander";
import dotenv from "dotenv";
import { getPackageInfo } from "@/utils";
import ora from "ora";
import { add } from "./commands/add";

dotenv.config();
export const spinner = ora();

export const main = async () => {
  const packageInfo = getPackageInfo();
  const program = new Command();

  program.version(
    packageInfo.version || "1.0.0",
    "-v, --version",
    "display the version number "
  );

  program.addCommand(add);

  program.parse();
};

main();
