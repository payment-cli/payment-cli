import { z } from "zod";
import { registrySchema } from "../validations";

export const resolveTree = async (
  register: z.infer<typeof registrySchema>,
  names: string[]
) => {
  const tree: z.infer<typeof registrySchema> = [];

  for (const name of names) {
    const registries = register.find((registry) => registry.name === name);
    if (!registries) continue;

    tree.push(registries);
    if (registries.registryDependencies) {
      const dependencies = await resolveTree(
        register,
        registries.registryDependencies
      );
      tree.push(...dependencies);
    }
  }

  return tree.filter(
    (component, index, self) =>
      self.findIndex((c) => c.name === component.name) === index
  );
};
