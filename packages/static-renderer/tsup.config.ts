import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  external: ["react", "react-dom", /^@tiptap\//],
  format: ["esm", "cjs"],
  sourcemap: true,
});
