import { execa } from "execa";
import { handleErrors } from "@/utils";

export default async function runCommand(
  command: string,
  args: string[]
): Promise<void> {
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
}
