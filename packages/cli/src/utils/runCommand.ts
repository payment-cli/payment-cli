import { execa } from "execa";
import { handleErrors } from "./handleErrors";
import consola from "consola";

export const runCommand = async (command: string, args: string[]) => {
  const formattedArgs = args.filter((a) => a !== "");
  try {
    await execa(command, formattedArgs, {
      stdio: "ignore",
      consola: false,
    });
  } catch (error) {
    handleErrors(error);
    process.exit(0);
  }
};
