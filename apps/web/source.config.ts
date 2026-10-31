import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { rehypePrettyCode } from "rehype-pretty-code";
import { z } from "zod";

import { DOCS_DIR } from "@/lib/docs";
import { transformers } from "@/lib/highlight-code";

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push([
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light-default",
          },
          transformers,
        },
      ]);

      return plugins;
    },
  },
});

export const docs = defineDocs({
  dir: DOCS_DIR,
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: frontmatterSchema.extend({
      seoTitle: z.string().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      author: z.string().default("Abdullah Mukadam"),
      date: z.string(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});
