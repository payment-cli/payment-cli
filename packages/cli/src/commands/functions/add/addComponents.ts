import { logger, spinner } from "@/utils";
import { createFiles, installDependencies, resolveItemsTree } from "@/commands/functions/add";

/**
 * Adds the specified components to the project.
 *
 * @param components - An array of component names to add.
 * @param opt - Options for adding components.
 * @param opt.overwrite - Whether to overwrite existing components.
 * @param opt.yes - Whether to automatically confirm prompts.
 * @returns A promise that resolves when the components have been added.
 *
 * @remarks
 * This function checks the registry for the specified components, creates the necessary files,
 * and installs any required dependencies.
 *
 * @example
 * ```typescript
 * await addComponents(['component1', 'component2'], { overwrite: true, yes: false });
 * ```
 */
export default async function addComponents(
  components: string[], 
  opt: { overwrite: boolean }
): Promise<void> {
  const registrySpinner = spinner({ text: `Checking registry.` })?.start()
  const tree = await resolveItemsTree(components);
  if (!tree) {
    registrySpinner?.fail();
    logger.warn("Selected components not found. Exiting.");
    process.exit(0);
  }
  registrySpinner?.succeed();

  await createFiles(tree.files, opt);
  await installDependencies(tree.dependencies);
}