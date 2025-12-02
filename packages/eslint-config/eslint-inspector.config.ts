import { defineConfig } from "./src/base";

export default defineConfig({
  tsconfigRootDir: import.meta.dirname,
  react: true,
  nextjs: true,
  tailwindEntryPoint: "./fake/globals.css",
});
