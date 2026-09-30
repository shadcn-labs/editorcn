import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/editor/index.ts",
    "src/block-editor/index.ts",
    "src/extensions/index.ts",
    "src/lib/cn.ts",
  ],
  external: ["react", "react-dom", "react/jsx-runtime"],
  format: ["esm", "cjs"],
  sourcemap: true,
});
