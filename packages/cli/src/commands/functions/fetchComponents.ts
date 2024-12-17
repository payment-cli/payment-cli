import { z } from "zod";
import { registrySchema, registryWithContentSchema } from "../validations";
import { fetchRegistry } from "../utils";

export const fetchComponents = async (tree: z.infer<typeof registrySchema>) => {
  const componentsLinks = tree
    .flatMap((entry) =>
      entry.registryDependencies?.map((dep) =>
        dep ? `content/${dep}.json` : undefined
      )
    )
    .filter((link): link is string => link !== undefined);
  if (!componentsLinks.length) {
    throw new Error(`No components not found.`);
  }

  const result = await fetchRegistry(componentsLinks);
  const registreParsed = registryWithContentSchema.parse(result);
  const findDependencies = registreParsed.filter((res) => {
    return res.registryDependencies;
  });

  let dependencies = [];
  for (const element of findDependencies) {
    const path = element?.registryDependencies
      ?.map((e) => `content/${e}.json`)
      .filter((link): link is string => link !== undefined);

    if (path && path.length > 0) {
      const register = await fetchRegistry(path);
      dependencies.push(...register);
    }
  }

  return [...registreParsed, ...registryWithContentSchema.parse(dependencies)];
};
