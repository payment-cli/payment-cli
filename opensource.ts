import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { TOPOFTREE, getPackageLocationsSync, getPackagesSync } from "oss-utils";

const openSourcePackages = getPackageLocationsSync()
  .map((workspacePath) =>
    JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), `${workspacePath}/package.json`),
        { encoding: "utf8" }
      )
    )
  )
  .filter((pkg) => pkg.publishConfig?.access === "public") as {
  name: string;
  publishConfig: {
    access: "public";
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}[];

const monorepoPackages = getPackagesSync().map((pkg) => pkg.name);

const packagesWithMonorepoDependencies = openSourcePackages
  .map((pkg) => {
    const allDependencies = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    const monorepoDependencies = Object.keys(allDependencies).filter((dep) =>
      monorepoPackages.includes(dep)
    );

    return {
      name: pkg.name,
      monorepoDependencies,
    };
  })
  .filter((pkg) => pkg.monorepoDependencies.length > 0);

if (packagesWithMonorepoDependencies.length > 0) {
  const nonOSSDeps = packagesWithMonorepoDependencies
    .map((pkg) => ({
      name: pkg.name,
      deps: pkg.monorepoDependencies.filter(
        (dep) => !openSourcePackages.some((ossPkg) => ossPkg.name === dep)
      ),
    }))
    .filter((pkg) => pkg.deps.length > 0);

  if (nonOSSDeps.length > 0) {
    console.error(
      "The following open source packages have non-open source monorepo dependencies:"
    );
    nonOSSDeps.forEach((pkg) => {
      console.error(`${pkg.name}:`);
      pkg.deps.forEach((dep) => {
        console.error(`  - ${dep}`);
      });
    });
    process.exit(1);
  }
}

const targetPackages = openSourcePackages.map((pkg) => pkg.name);

// Get all the packages in the monorepo
const packages = getPackagesSync().map((pkg) => ({
  ...pkg,
  path: path.relative(TOPOFTREE, pkg.path),
}));

// packages.forEach(pkg => {
//   console.log(pkg.path, path.relative(TOPOFTREE, pkg.path))
// })

// Filter all packages by target packages and form query
const args = process.argv.slice(2);

const force = args.length > 0 ? (args[0] === "force" ? "--force" : "") : "";

const packagesWithPaths = packages
  .filter(({ name }) => targetPackages.includes(name))
  .map(({ path }) => `--path ${path}`)
  .join(" ");

const templatedGitFilterRepoQuery = `git filter-repo ${packagesWithPaths} ${force}`;

console.log({
  TOPOFTREE,
  targetPackages,
  templatedGitFilterRepoQuery,
});

console.log(execSync(templatedGitFilterRepoQuery).toString());
