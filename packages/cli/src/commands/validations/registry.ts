import { z } from "zod";

export const registryItemFileSchema = z.object({
  path: z.string(),
  content: z.string().optional(),
  type: z.string(),
})

export const registryBaseSchema = z.object({
  name: z.string(),
  type: z.string(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
});

export const registryListSchema = z.array(registryBaseSchema);

export const registryItemContentSchema = registryBaseSchema.extend({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

export const registryItemContentListSchema = z.array(registryItemContentSchema);

export const registryResolvedItemsTreeSchema = registryBaseSchema.pick({
  dependencies: true,
  files: true,
}).extend({
  devDependencies: z.array(z.string().optional()).default([]),
});