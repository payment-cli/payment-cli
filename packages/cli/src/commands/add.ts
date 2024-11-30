import prompts from "prompts";
import { Command } from "commander";
import { existsSync, promises as fs } from "fs";

import { getRegistry } from "@/commands/utils/getRegistry";
import { addOptionsSchema } from "@/commands/validations";
import { resolveTree } from "@/commands/functions";
import {
  getPackageManager,
  handleErrors,
  installPackages,
  logger,
} from "@/utils";
import { fetchComponents } from "@/commands/functions";
import { spinner } from "@/index";
import consola from "consola";

export const add = new Command()
  .command("add")
  .description("Add components for you project")
  .argument("[components...]", "The component you want to add")
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option("-y, --yes", "skip confirmation prompt.", true)
  .action(async (components, opt) => {
    try {
      const options = addOptionsSchema.parse({ components, ...opt });

      const packageManager = getPackageManager();
      const registryIndex = await getRegistry();

      let selectedComponents = options.components?.length
        ? options.components
        : registryIndex.map((entry) => entry.name);

      if (!options.components?.length) {
        const { components } = await prompts({
          type: "multiselect",
          name: "components",
          message: "Which components would you like to add?",
          hint: "Space to select. A to toggle all. Enter to submit.",
          instructions: false,
          choices: registryIndex.map((entry) => ({
            title: entry.name,
            value: entry.name,
            selected: options.components?.includes(entry.name),
          })),
        });
        selectedComponents = components;
      }

      if (!selectedComponents?.length) {
        logger.warn("No components selected. Exiting.");
        process.exit(0);
      }

      const tree = await resolveTree(registryIndex, selectedComponents);
      const componentsTree = await fetchComponents(tree);
      if (!componentsTree.length) {
        logger.warn("Selected components not found. Exiting.");
        process.exit(0);
      }

      if (!options.yes) {
        const { proceed } = await prompts({
          type: "confirm",
          name: "proceed",
          message: `Ready to install components and dependencies. Proceed?`,
          initial: true,
        });

        if (!proceed) {
          process.exit(0);
        }
      }

      spinner.start();
      spinner.text = "Installing dependencies";
      for (const component of componentsTree) {
        spinner.text = `Installing ${component.name}...`;
        const componentType = component.type.split(":");
        const folderPath = componentType[0];
        const componentMain = componentType[1];

        const targetPath = `./src/components/${folderPath}`;
        if (!existsSync(targetPath)) {
          await fs.mkdir(targetPath, { recursive: true });
        }

        // generate overwriting files
        const existFile = component.files.map((file) => {
          return existsSync(`${targetPath}/${file.name}`);
        });
        if (existFile.includes(true) && !options.overwrite) {
          if (selectedComponents.includes(componentMain)) {
            spinner.stop();
            const { overwrite } = await prompts({
              type: "confirm",
              name: "overwrite",
              message: `Files already exist for ${component.name}. Overwrite?`,
              initial: false,
            });
            if (!overwrite) {
              spinner.warn("Skipping component");
              continue;
            }

            spinner.start(`Installing ${component.name}...`);
          } else {
            continue;
          }
        }

        spinner.text = `Installing ${component.name}...`;
        for (const file of component.files) {
          await fs.writeFile(`${targetPath}/${file.name}`, file.content);
        }

        if (component.dependencies?.length) {
          await installPackages(
            { regular: component.dependencies.join(" ") },
            packageManager
          );
        }

        if (component.devDependencies?.length) {
          await installPackages(
            { dev: component.devDependencies.join(" ") },
            packageManager
          );
        }
      }
      spinner.succeed("Done.");
      spinner.stop();
    } catch (error) {
      handleErrors(error);
    }
  });
