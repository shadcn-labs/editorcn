import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  external: [
    "react",
    "react-dom",
    /^@tiptap\//,
    "@floating-ui/dom",
    "lowlight",
    /^@base-ui\//,
    "class-variance-authority",
  ],
  format: ["esm", "cjs"],
  sourcemap: true,
});
