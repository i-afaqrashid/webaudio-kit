import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@webaudio-kit/core": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url),
      ),
      "@webaudio-kit/react": fileURLToPath(
        new URL("../../packages/react/src/index.tsx", import.meta.url),
      ),
    },
  },
});
