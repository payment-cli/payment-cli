import { z } from "zod";

export const registryBaseSchema = z.object({
  name: z.string(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(z.string()).optional(),
  type: z.string(),
});

export const registrySchema = z.array(registryBaseSchema);

export const registryItemContentSchema = registryBaseSchema.extend({
  files: z.array(
    z.object({
      name: z.string(),
      content: z.string(),
    })
  ),
});

export const registryWithContentSchema = z.array(registryItemContentSchema);
