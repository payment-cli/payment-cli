import { Command } from "commander";

import { addOptionsSchema } from "@/commands/validations";
import { getRegistryComponents } from "@/commands/functions";
import { handleErrors } from "@/utils";
import addComponents from "./functions/add/addComponents";

export const add = new Command()
  .command("add")
  .description("Add components for you project")
  .argument("[components...]", "The component you want to add")
  .option("-o, --overwrite", "overwrite existing files.", false)
  .action(async (components, opt) => {
    try {
      const options = addOptionsSchema.parse({ components, ...opt });
      if (!options.components?.length) {
        options.components = await getRegistryComponents(options);
      }

      await addComponents(options.components, options);
    } catch (error) {
      handleErrors(error);
    }
  });
