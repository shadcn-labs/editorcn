import { readText } from "./discover.ts";
import type { CssRules, ItemTheme } from "./types.ts";

interface Block {
  body: Node[];
  prelude: string;
}

interface Declaration {
  property: string;
  value: string;
}

type Node = Block | Declaration;

const isBlock = (node: Node): node is Block => "body" in node;

const parseBody = (css: string, label: string, start = 0) => {
  const nodes: Node[] = [];
  let buffer = "";
  let index = start;
  while (index < css.length) {
    const char = css[index];
    if (char === "{") {
      const inner = parseBody(css, label, index + 1);
      nodes.push({ body: inner.nodes, prelude: buffer.trim() });
      buffer = "";
      index = inner.end + 1;
    } else if (char === "}") {
      if (buffer.trim()) {
        throw new Error(`${label}: missing ";" before "}"`);
      }
      return { end: index, nodes };
    } else if (char === ";") {
      const colon = buffer.indexOf(":");
      if (colon === -1) {
        throw new Error(`${label}: can't parse "${buffer.trim()}"`);
      }
      nodes.push({
        property: buffer.slice(0, colon).trim(),
        value: buffer
          .slice(colon + 1)
          .trim()
          .replaceAll(/\s+/g, " "),
      });
      buffer = "";
      index += 1;
    } else {
      buffer += char;
      index += 1;
    }
  }
  if (start > 0) {
    throw new Error(`${label}: unclosed "{"`);
  }
  if (buffer.trim()) {
    throw new Error(`${label}: unexpected "${buffer.trim()}"`);
  }
  return { end: index, nodes };
};

const toRules = (nodes: Node[]): CssRules =>
  Object.fromEntries(
    nodes.map((node) =>
      isBlock(node)
        ? [node.prelude.replaceAll(/\s+/g, " "), toRules(node.body)]
        : [node.property, node.value]
    )
  );

const addEntry = <T>(
  target: Record<string, T>,
  key: string,
  value: T,
  label: string
) => {
  if (key in target && JSON.stringify(target[key]) !== JSON.stringify(value)) {
    throw new Error(
      `${label}: "${key}" is defined twice with different values`
    );
  }
  target[key] = value;
};

export const readTheme = (path: string, label: string): ItemTheme => {
  const css = readText(path).replaceAll(/\/\*[\s\S]*?\*\//g, "");
  const theme: ItemTheme = { css: {}, theme: {} };
  for (const node of parseBody(css, label).nodes) {
    if (!isBlock(node)) {
      throw new Error(`${label}: "${node.property}" must be inside a rule`);
    }
    if (node.prelude === "@theme") {
      for (const child of node.body) {
        if (isBlock(child)) {
          if (!child.prelude.startsWith("@keyframes ")) {
            throw new Error(
              `${label}: @theme may only hold variables and @keyframes`
            );
          }
          addEntry(theme.css, child.prelude, toRules(child.body), label);
        } else if (child.property.startsWith("--animate-")) {
          addEntry(theme.theme, child.property.slice(2), child.value, label);
        } else {
          throw new Error(
            `${label}: only --animate-* variables are supported in @theme`
          );
        }
      }
    } else if (node.prelude.startsWith("@property ")) {
      addEntry(theme.css, node.prelude, toRules(node.body), label);
    } else {
      throw new Error(
        `${label}: only @theme and @property are supported, found "${node.prelude}"`
      );
    }
  }
  return theme;
};

export const mergeThemes = (themes: ItemTheme[], label: string) => {
  const merged: ItemTheme = { css: {}, theme: {} };
  for (const { css, theme } of themes) {
    for (const [key, value] of Object.entries(css)) {
      addEntry(merged.css, key, value, label);
    }
    for (const [key, value] of Object.entries(theme)) {
      addEntry(merged.theme, key, value, label);
    }
  }
  return merged;
};
