import { fetchRegistry } from "@/commands/utils";
import { registryItemContentSchema } from "@/commands/validations";
import { handleErrors } from "@/utils";

const componentUrlSet = new Set<string>();
const downloadedComponents = new Set<string>();

/**
 * Fetches components by name and their dependencies from a registry.
 * 
 * This function downloads a JSON file corresponding to the given component name,
 * parses its content, and recursively fetches any dependencies listed in the registry data.
 * 
 * @param name - The name of the component to fetch.
 * @returns A promise that resolves to an array of component URLs.
 * 
 * @throws Will throw an error if there is an issue fetching or parsing the registry item.
 */
export default async function fetchComponents(name: string): Promise<string[]> {
  await (async () =>{
    const url = `content/${name}.json`;
    if (downloadedComponents.has(name)) return;
    downloadedComponents.add(name);
    
    try {
      const [registry] = await fetchRegistry([url]);
      const registryData = registryItemContentSchema.parse(registry);

      componentUrlSet.add(url);

      if (registryData.registryDependencies) {
        for (const dependency of registryData.registryDependencies) {
          await fetchComponents(dependency);
        }
      }
    } catch (error) {
      handleErrors(`Error fetching or parsing registry item`,);
    }
  })();

  return [...componentUrlSet];
};
