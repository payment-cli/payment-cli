import { getPackageManager, installPackages, spinner } from "@/utils";
import { RegistryItemType } from "@/commands/types";

/**
 * Installs the specified dependencies using the appropriate package manager.
 *
 * @param dependencies - An array of dependency names to be installed.
 * @returns A promise that resolves when the installation is complete.
 */
export default async function installDependencies(
  dependencies: RegistryItemType["dependencies"],
): Promise<void> {
  if (!dependencies) return;

  const dependenciesSpinner = spinner({ 
    text:`Installing dependencies` 
  })?.start()
  const packageManager = getPackageManager();

  dependenciesSpinner?.start();  

  await installPackages(
    { regular: dependencies.join(" ") },
    packageManager
  );

  dependenciesSpinner?.succeed();
}