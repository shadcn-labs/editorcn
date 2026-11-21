import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "**/public/r/**",
    "**/.next/**",
    "**/.source/**",
    "**/dist/**",
    ".agents/**",
    ".cursor/**",
    ".changeset/**",
    ".claude/**",
  ],
  overrides: [
    {
      files: [
        "packages/editor/src/**",
        "packages/block-editor/src/**",
        "packages/extensions/src/**",
        "packages/static-renderer/src/**",
        "apps/web/src/components/templates/**",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                message:
                  "Import primitives from the package's ui/ folder so the registry can ship Base UI and Radix variants.",
                regex: "^(@base-ui/|@radix-ui/|radix-ui$)",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        "packages/editor/src/ui/**",
        "packages/block-editor/src/ui/**",
        "packages/extensions/src/ui/**",
      ],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
});
