import { handleErrors } from "@/utils";
import { RegistryListType } from "@/commands/types";

/**
 * Fetches registry data from the specified paths.
 *
 * @param {string[]} paths - An array of paths to fetch the registry data from.
 * @returns {Promise<RegistryListType[]>} A promise that resolves to an array of registry data.
 * @throws Will throw an error if the fetch operation fails.
 */
export default async function fetchRegistry(paths: string[]): Promise<RegistryListType> {
  try {
    return await Promise.all(
      paths.map(async (path) => {        
        const response = await fetch(
          `${process.env.REGISTRY_URL ?? "https://docs.paymentcli.xyz/registry"}/${path}`
        );        
        return await response.json();
      })
    );
  } catch (error) {
    handleErrors("Failed to connect to the components library.");
    process.exit(0);
  }
};
