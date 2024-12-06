import consola from "consola";
import { PMType } from "@/types";
import { spinner } from "@/index";
import { runCommand } from "./runCommand";
import { handleErrors } from "./handleErrors";

export const installPackages = async (
  packages: { regular: string } | { dev: string; text?: string },
  pmType: PMType
) => {
  const installCommand = pmType === "npm" ? "install" : "add";

  try {
    if ("regular" in packages) {
      await runCommand(
        pmType,
        [installCommand].concat(packages.regular.split(" "))
      );
    }
    if ("dev" in packages) {
      await runCommand(
        pmType,
        [installCommand, "-D"].concat(packages.dev.split(" "))
      );
    }
  } catch (error) {
    handleErrors(error);
    process.exit(0);
  }
};
