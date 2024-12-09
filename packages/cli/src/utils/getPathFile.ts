import { join } from "path";

export const configPath = (file: string): string => join(process.cwd(), file);
