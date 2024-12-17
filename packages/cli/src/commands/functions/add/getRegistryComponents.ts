import { z } from "zod";
import prompts from "prompts";

import { handleErrors } from "@/utils";
import { addOptionsSchema } from "@/commands/validations";
import { getRegistryIndex } from "@/commands/utils";

/**
 * Retrieves the registry components based on user selection.
 *
 * @param options - The options object inferred from the addOptionsSchema.
 * @returns A promise that resolves to an array of selected component names.
 *
 * @throws Will throw an error if no components are selected or if the selected components are invalid.
 */
export default async function getRegistryComponents(
  options: z.infer<typeof addOptionsSchema>
): Promise<Array<string>> {
  const registryIndex = await getRegistryIndex();
  const componentsList = registryIndex.map((entry) => entry.name);

  const { components } = await prompts({
    type: "multiselect",
    name: "components",
    message: "Which components would you like to add?",
    hint: "Space to select. A to toggle all. Enter to submit.",
    instructions: false,
    choices: componentsList.map((entry) => ({
      title: entry,
      value: entry,
      selected: options.components?.includes(entry),
    })),
  });
  if (!components?.length) {
    handleErrors("No components selected. Exiting.");
  }

  const validatedComponents = z.array(z.string()).safeParse(components);
  if (!validatedComponents.success) {
    handleErrors("Invalid components selected. Exiting.");
  }

  return validatedComponents.data!;
};