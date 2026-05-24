#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const expectedRepository =
  "git+https://github.com/i-afaqrashid/webaudio-kit.git";
const packageOrder = [
  "@webaudio-kit/core",
  "@webaudio-kit/react",
  "@webaudio-kit/cli",
];
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const packageDirArg = args.find((arg) => !arg.startsWith("--"));
const packageDir = resolve(root, packageDirArg ?? ".release-packages");
const rootPackage = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);

if (!existsSync(packageDir)) {
  throw new Error(`Package directory does not exist: ${packageDir}`);
}

const tarballsByName = new Map();
const tarballs = readdirSync(packageDir)
  .filter((fileName) => fileName.endsWith(".tgz"))
  .map((fileName) => resolve(packageDir, fileName));

for (const tarball of tarballs) {
  const packageJson = readPackageJsonFromTarball(tarball);

  if (tarballsByName.has(packageJson.name)) {
    throw new Error(`Duplicate tarball for ${packageJson.name}`);
  }

  tarballsByName.set(packageJson.name, { packageJson, tarball });
}

const missingPackages = packageOrder.filter(
  (name) => !tarballsByName.has(name),
);
const unexpectedPackages = [...tarballsByName.keys()].filter(
  (name) => !packageOrder.includes(name),
);

if (missingPackages.length > 0 || unexpectedPackages.length > 0) {
  throw new Error(
    [
      "Release tarball set does not match expected packages.",
      missingPackages.length > 0
        ? `Missing: ${missingPackages.join(", ")}`
        : undefined,
      unexpectedPackages.length > 0
        ? `Unexpected: ${unexpectedPackages.join(", ")}`
        : undefined,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

for (const name of packageOrder) {
  const releasePackage = tarballsByName.get(name);
  assertPackageMetadata(releasePackage.packageJson);

  const version = releasePackage.packageJson.version;
  if (awaitPackageExists(name, version)) {
    throw new Error(`${name}@${version} already exists on npm`);
  }

  const publishArgs = [
    "publish",
    releasePackage.tarball,
    "--access",
    "public",
    "--provenance",
  ];

  if (dryRun) {
    publishArgs.push("--dry-run", "--loglevel=error");
  }

  run("npm", publishArgs);
}

console.log(
  `${dryRun ? "Dry-run published" : "Published"} ${packageOrder.length} package tarballs`,
);

function readPackageJsonFromTarball(tarball) {
  const output = execFileSync(
    "tar",
    ["-xOf", tarball, "package/package.json"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

  return JSON.parse(output);
}

function assertPackageMetadata(packageJson) {
  if (packageJson.version !== rootPackage.version) {
    throw new Error(
      `${packageJson.name} version ${packageJson.version} does not match root ${rootPackage.version}`,
    );
  }

  if (packageJson.private) {
    throw new Error(`${packageJson.name} must not be private`);
  }

  if (packageJson.publishConfig?.access !== "public") {
    throw new Error(
      `${packageJson.name} must declare publishConfig.access as public`,
    );
  }

  if (packageJson.repository?.url !== expectedRepository) {
    throw new Error(
      `${packageJson.name} repository.url must be ${expectedRepository}, received ${
        packageJson.repository?.url ?? "undefined"
      }`,
    );
  }
}

function awaitPackageExists(name, version) {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });

  if (result.status === 0) {
    return result.stdout.trim() === version;
  }

  const output = `${result.stdout}\n${result.stderr}`;
  if (output.includes("E404") || output.includes("404 Not Found")) {
    return false;
  }

  throw new Error(`Could not check npm registry for ${name}@${version}`);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}
