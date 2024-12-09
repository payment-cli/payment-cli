import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    ".": "src/index.ts",
  },
  format: ["cjs", "esm"],
  noExternal: ["@rccpr/trie-router"],
  dts: true,
});
