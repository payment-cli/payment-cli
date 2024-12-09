import { fetchRegistry, getRegistryIndex } from "@/commands/utils";
import { registryResolvedItemsTreeSchema, registryListSchema } from "@/commands/validations";
import fetchComponents from "./fetchComponents";
import { handleErrors } from "@/utils";
import { RegistryResolvedItemsTreeType } from "@/commands/types";

/**
 * Resolves the items tree based on the provided names.
 * 
 * @param names - An array of strings representing the names to resolve.
 * @returns A promise that resolves to the parsed registry resolved items tree schema or null if an error occurs.
 * 
 */
export default async function resolveItemsTree(
  names: string[]
): Promise<RegistryResolvedItemsTreeType | null> {
  try {
    if (names.includes("index")) names.unshift("index")
    
    const index = await getRegistryIndex();
    if (!index) return null
    const parsedRegistryList = registryListSchema.parse(index);
    
    const dependencies: string[] = [];
    
    for await (const name of names) {
      const registryDependencies = parsedRegistryList.find(x => x.name === name)?.registryDependencies;
  
      await Promise.all(
        registryDependencies?.map(async (dependency) => {
          const fetchedDependency = await fetchComponents(dependency);
          dependencies.push(...fetchedDependency);
        }) || []
      );
    }

    const result = await fetchRegistry(dependencies);
    const payload = registryListSchema.parse(result);
    if (!payload) return null;

    return registryResolvedItemsTreeSchema.parse({
      dependencies: Array.from(new Set(payload.flatMap(x => x.dependencies))),
      devDependencies: Array.from(new Set(payload.flatMap(x => x.devDependencies)) || []),
      files: Array.from(new Set(payload.flatMap(x => x.files))),
    }); 
  } catch (error) {
    handleErrors(error);
    return null;
  }
};
