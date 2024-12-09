import { z } from "zod";
import { 
  registryBaseSchema, 
  registryItemContentSchema, 
  registryItemFileSchema, 
  registryListSchema, 
  registryResolvedItemsTreeSchema 
} from "@/commands/validations";

export type RegistryListType = z.infer<typeof registryListSchema>;
export type RegistryItemType = z.infer<typeof registryBaseSchema>;
export type RegistryItemContentType = z.infer<typeof registryItemContentSchema>;
export type RegistryItemFileType = z.infer<typeof registryItemFileSchema>;
export type RegistryResolvedItemsTreeType = z.infer<typeof registryResolvedItemsTreeSchema>;