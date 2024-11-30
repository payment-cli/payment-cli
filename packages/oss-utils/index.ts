import { execSync } from "child_process";
import path from "path";
import { findNearestPackageJsonSync } from "find-nearest-package-json";

export const TOPOFTREE = execSync("git rev-parse --show-toplevel")
  .toString()
  .trim();

export async function findWorkspaceRoot() {
  return TOPOFTREE;
}

async function getPackages() {
  const result = execSync("yarn workspaces info", { encoding: "utf-8" });
  const workspacePackages = result
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line))
    .map(({ location, name }) => ({
      manifest: { name },
      dir: path.join(TOPOFTREE, location),
    }));

  return workspacePackages.slice(1);
}

async function getScopes() {
  const packages = await getPackages();

  const scopedPackages = packages.filter(({ manifest }) =>
    manifest.name?.startsWith("@")
  );

  const scopes = Array.from(
    new Set(scopedPackages.map((pkg) => pkg.manifest?.name?.split("/")[0]))
  ) as string[];

  return scopes.map((scope) => {
    const match = packages.find(({ manifest }) =>
      manifest.name?.startsWith(scope)
    );

    if (!match) {
      throw new Error();
    }

    const dir = match?.dir.split("/");

    dir.pop();

    return { scope, dir: dir.join("/") };
  });
}

async function getPackageNames() {
  const packages = await getPackages();

  return packages.map(({ manifest }) => manifest.name);
}

async function getPackageLocations() {
  const packages = await getPackages();

  return packages.map(({ dir }) => dir.replace(`${TOPOFTREE}/`, ""));
}

type PackageDef = {
  name: string;
  version: string;
  location: string;
  path: string;
  private: boolean;
};

type Info = Record<
  string,
  {
    location: string;
    workspaceDependencies: string[];
    mismatchedWorkspaceDependencies: string[];
  }
>;

function getPackagesSync(): PackageDef[] {
  const output = execSync("yarn workspaces info").toString();

  return Object.entries(JSON.parse(output) as Info)
    .map(([name, { location }]) => ({
      name,
      version: "", // Would need additional package.json read to get version
      location,
      path: path.join(TOPOFTREE, location),
      private: false, // Would need additional package.json read to get private status
    }))
    .slice(1);
}

function getPackageNamesSync() {
  return getPackagesSync().map(({ name }) => name);
}

function getPackageLocationsSync() {
  return getPackagesSync().map(({ location }) => location);
}

function getAffectedPackagesForChangedFiles() {
  return (
    execSync(
      "git diff origin/main --name-only --diff-filter=ACMR | sed 's| |\\ |g'"
    )
      .toString()
      .trim()
      .split("\n") as string[]
  )
    .filter((f) => f)
    .map(
      (file) => findNearestPackageJsonSync(`${TOPOFTREE}/${file}`).data.name
    );
}

function getAffectedPackagesForStagedFiles() {
  return (
    execSync(
      "git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g'"
    )
      .toString()
      .trim()
      .split("\n") as string[]
  )
    .filter((f) => f)
    .map(
      (file) => findNearestPackageJsonSync(`${TOPOFTREE}/${file}`).data.name
    );
}

function getAffectedPackagesToStagedFilesMapping() {
  return (
    execSync(
      "git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g'"
    )
      .toString()
      .trim()
      .split("\n") as string[]
  )
    .filter((f: string) => f)
    .reduce(
      (memo, file) => {
        const nearestPackageName: string =
          findNearestPackageJsonSync(file).data.name;

        if (!memo[nearestPackageName]) {
          memo[nearestPackageName] = [];
        }
        memo[nearestPackageName].push(file);

        return memo;
      },
      {} as Record<string, string[]>
    );
}

const GLOBAL_SCOPES = ["all", "app", "service", "package", "deps", "dopt"];

export {
  getAffectedPackagesForChangedFiles,
  getAffectedPackagesForStagedFiles,
  getAffectedPackagesToStagedFilesMapping,
  getPackageLocations,
  getPackageLocationsSync,
  getPackageNames,
  getPackageNamesSync,
  getPackages,
  getPackagesSync,
  getScopes,
  GLOBAL_SCOPES,
};
