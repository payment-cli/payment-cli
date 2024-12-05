import { registryItemContentListSchema } from "@/commands/validations";
import { fetchRegistry } from "@/commands/utils";
import { handleErrors } from "@/utils";
import { RegistryItemContentType } from "../types";

/**
 * Retrieves the sub-dependencies for the given paths from the registry.
 *
 * @param paths - An array of strings representing the paths to fetch sub-dependencies for.
 * @returns A promise that resolves to an array of `RegistryItemContentType` objects.
 * @throws Will handle errors and exit the process if the connection to the components library fails.
 */
export default async function getSubDependencies(paths: string[]): Promise<RegistryItemContentType[]> {
  try {
    const response = await fetchRegistry(paths);
    return registryItemContentListSchema.parse(response);
  } catch (error) {
    handleErrors("Failed to connect to the components library.");
    process.exit(0);
  }
};
