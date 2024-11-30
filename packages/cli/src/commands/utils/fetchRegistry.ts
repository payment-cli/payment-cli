import { handleErrors } from "@/utils";

export const fetchRegistry = async (paths: string[]) => {
  try {
    const results = await Promise.all(
      paths.map(async (path) => {
        const response = await fetch(
          `${process.env.REGISTRY_URL ?? "https://docs.paymentcli.xyz/registry"}/${path}`
        );
        return await response.json();
      })
    );

    return results;
  } catch (error) {
    handleErrors("Failed to connect to the components library.");
    process.exit(0);
  }
};
