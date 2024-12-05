import { PMType } from "@/types";
import { runCommand, handleErrors } from "@/utils";

/**
 * Installs the specified packages using the provided package manager type.
 *
 * @param packages - An object containing either regular or dev packages to install.
 * @param packages.regular - A string of regular packages to install, separated by spaces.
 * @param packages.dev - A string of dev packages to install, separated by spaces.
 * @param pmType - The type of package manager to use ("npm" or other).
 * @returns A promise that resolves when the installation is complete.
 *
 * @throws Will handle errors and exit the process with code 0 if an error occurs during installation.
 */
export default async function installPackages(
  packages: { regular: string } | { dev: string },
  pmType: PMType
): Promise<void> {
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
