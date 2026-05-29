import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@webaudio-kit/cli": fileURLToPath(
        new URL("./packages/cli/src/index.ts", import.meta.url),
      ),
      "@webaudio-kit/core": fileURLToPath(
        new URL("./packages/core/src/index.ts", import.meta.url),
      ),
      "@webaudio-kit/react": fileURLToPath(
        new URL("./packages/react/src/index.tsx", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    testTimeout: 10_000,
    include: [
      "apps/**/*.test.ts",
      "apps/**/*.test.tsx",
      "packages/**/*.test.ts",
      "packages/**/*.test.tsx",
    ],
    benchmark: {
      include: ["benchmarks/**/*.bench.ts", "benchmarks/**/*.bench.tsx"],
    },
    coverage: {
      provider: "v8",
      include: ["packages/core/src/**", "packages/react/src/**"],
      exclude: ["**/*.test.*", "**/*.d.ts"],
      thresholds: {
        statements: 90,
        branches: 84,
        functions: 92,
        lines: 90,
      },
    },
  },
});
