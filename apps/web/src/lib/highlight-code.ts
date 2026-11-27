import { LRUCache } from "lru-cache";
import type { ShikiTransformer } from "shiki";
import { codeToHtml } from "shiki";

const highlightCache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60,
});

const COMMANDS = [
  { bun: "bun add", npm: "npm install", pnpm: "pnpm add", yarn: "yarn add" },
  {
    bun: "bunx --bun create-",
    npm: "npx create-",
    pnpm: "pnpm create ",
    yarn: "yarn create ",
  },
  {
    bun: "bun create",
    npm: "npm create",
    pnpm: "pnpm create",
    yarn: "yarn create",
  },
  { bun: "bunx --bun", npm: "npx", pnpm: "pnpm dlx", yarn: "yarn dlx" },
  { bun: "bun", npm: "npm run", pnpm: "pnpm", yarn: "yarn" },
];

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const transformers = [
  {
    code(node) {
      if (node.tagName === "code") {
        const raw = this.source;
        node.properties.__raw__ = raw;

        const command = COMMANDS.find(({ npm }) => raw.startsWith(npm));
        if (command) {
          for (const manager of ["npm", "yarn", "pnpm", "bun"] as const) {
            node.properties[`__${manager}__`] = raw.replaceAll(
              new RegExp(`^${escapeRegExp(command.npm)}`, "gm"),
              command[manager]
            );
          }
        }
      }
    },
  },
] as ShikiTransformer[];

export const highlightCode = async (code: string, language = "tsx") => {
  const cacheKey = `${language}:${code}`;

  const cached = highlightCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const html = await codeToHtml(code, {
    lang: language,
    themes: {
      dark: "github-dark",
      light: "github-light",
    },
    transformers: [
      {
        code(node) {
          node.properties["data-line-numbers"] = "";
        },
        line(node) {
          node.properties["data-line"] = "";
        },
        pre(node) {
          node.properties.class =
            "no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0 !bg-transparent";
        },
      },
    ],
  });

  highlightCache.set(cacheKey, html);

  return html;
};
