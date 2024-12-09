import { Command } from "commander";
import dotenv from "dotenv";

import { add } from "@/commands/add";
import { getPackageInfo } from "@/utils";

dotenv.config();

export const main = async () => {
  const packageInfo = getPackageInfo();
  const program = new Command();

  program
    .name(packageInfo.name || "cli")
    .description(packageInfo.description || "A CLI for managing packages")
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "display the version number "
    );

  program.addCommand(add);

  program.parse();
};

main();
