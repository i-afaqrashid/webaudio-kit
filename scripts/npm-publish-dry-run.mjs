#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const rootPackage = JSON.parse(
  await readFile(join(root, "package.json"), "utf8"),
);
const packDir = join(root, ".release-packages");
const tarballs = [
  join(packDir, `webaudio-kit-core-${rootPackage.version}.tgz`),
  join(packDir, `webaudio-kit-react-${rootPackage.version}.tgz`),
];

for (const tarball of tarballs) {
  await access(tarball);
  run("npm", ["publish", tarball, "--access", "public", "--dry-run"], root);
}

console.log(`npm publish dry-run passed for ${tarballs.length} tarballs`);

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}
