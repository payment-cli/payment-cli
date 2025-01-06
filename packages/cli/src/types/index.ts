export type PackageInfo = {
  name: string;
  version: string;
  description: string;
  main: string;
  scripts: Record<string, string>;
  repository: {
    type: string;
    url: string;
  };
  keywords: string[];
};

export type PMType = "npm" | "yarn" | "pnpm" | "bun";
