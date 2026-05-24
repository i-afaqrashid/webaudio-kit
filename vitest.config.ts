import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
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
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx"],
  },
});
