import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const expectedExamples = ["vite-react", "next-app-router", "plain-react"];
const packageVersion = JSON.parse(readFileSync("package.json", "utf8")).version;

test("standalone framework examples are documented and checked", () => {
  const checker = readFileSync("scripts/check-example-apps.mjs", "utf8");
  const examplesReadme = readFileSync("examples/README.md", "utf8");
  const docsExamples = readFileSync("docs/examples.md", "utf8");

  for (const example of expectedExamples) {
    const directory = join("examples", example);
    assert.equal(existsSync(directory), true, `${directory} must exist`);
    assert.match(checker, new RegExp(`"${example}"`));
    assert.match(examplesReadme, new RegExp(`\`${example}\``));
    assert.match(docsExamples, new RegExp(`examples/${example}`));

    const manifestPath = join(directory, "package.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    assert.equal(manifest.private, true);
    assert.equal(
      manifest.dependencies["@webaudio-kit/react"],
      `^${packageVersion}`,
      `${manifestPath} should use the current published package range`,
    );
    assert.doesNotMatch(
      JSON.stringify(manifest.dependencies),
      /workspace:|file:|link:|portal:/,
      `${manifestPath} should not use local workspace shortcuts`,
    );

    const readme = readFileSync(join(directory, "README.md"), "utf8");
    assert.match(readme, /pnpm examples:check/);
    assert.match(readme, /@webaudio-kit\/react/);
  }
});
