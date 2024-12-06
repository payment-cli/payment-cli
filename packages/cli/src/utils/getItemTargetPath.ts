import { Config, registryBaseSchema } from "@/commands/validations";
import { z } from "zod";
import path from "path";

export const getItemTargetPath = async (
  config: Config,
  item: Pick<z.infer<typeof registryBaseSchema>, "type">
) => {
  if (item.type === "components:ui" && config.aliases.ui) {
    return config.resolvedPaths.ui;
  }

  const [parent, type] = item.type.split(":");
  if (!(parent in config.resolvedPaths)) {
    return null;
  }

  return path.join(
    config.resolvedPaths[parent as keyof typeof config.resolvedPaths],
    type
  );
};
