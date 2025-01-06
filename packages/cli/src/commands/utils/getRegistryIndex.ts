import { handleErrors } from "@/utils";
import { registryListSchema } from "@/commands/validations";
import {fetchRegistry} from "@/commands/utils";
import { RegistryListType } from "../types";

/**
 * Fetches and parses the registry index from the components library.
 *
 * @returns {Promise<Array<RegistryListType>>} A promise that resolves to an array of RegistryListType objects.
 * @throws Will handle errors and exit the process if the connection to the components library fails.
 */
export default async function getRegistryIndex(): Promise<RegistryListType> {
  try {
    const [response] = await fetchRegistry(["index.json"]);
    return registryListSchema.parse(response);
  } catch (error) {
    handleErrors("Failed to connect to the components library.");
    process.exit(0);
  }
};
