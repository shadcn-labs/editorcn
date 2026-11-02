import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;
interface Token {
  from: number;
  to: number;
  style: string;
}

const THEMES = { dark: "github-dark", light: "github-light" } as const;
const PLAIN = new Set(["plaintext", "text", "txt", "plain"]);

let highlighter: Highlighter | undefined;
let highlighterPromise: Promise<Highlighter> | undefined;
const requested = new Set<string>();
const listeners = new Set<() => void>();
const cache = new WeakMap<PMNode, Token[]>();

const createShikiHighlighter = async () => {
  const { createHighlighter } = await import("shiki");
  highlighter = await createHighlighter({
    langs: [],
    themes: [THEMES.light, THEMES.dark],
  });
  return highlighter;
};

const requestLanguage = async (language: string) => {
  if (requested.has(language)) {
    return;
  }
  requested.add(language);
  try {
    highlighterPromise ??= createShikiHighlighter();
    const instance = await highlighterPromise;
    const { bundledLanguages } = await import("shiki");
    if (language in bundledLanguages) {
      await instance.loadLanguage(language as BundledLanguage);
    }
    for (const listener of listeners) {
      listener();
    }
  } catch {
    requested.delete(language);
  }
};

const tokenize = (node: PMNode): Token[] => {
  const cached = cache.get(node);
  if (cached) {
    return cached;
  }
  const language = (node.attrs.language as string | null) || "plaintext";
  if (PLAIN.has(language)) {
    return [];
  }
  if (!highlighter?.getLoadedLanguages().includes(language)) {
    void requestLanguage(language);
    return [];
  }
  const { tokens } = highlighter.codeToTokens(node.textContent, {
    defaultColor: false,
    lang: language as BundledLanguage,
    themes: THEMES,
  });
  const result = tokens.flat().flatMap((token) =>
    token.htmlStyle
      ? [
          {
            from: token.offset,
            style: Object.entries(token.htmlStyle)
              .map(([key, value]) => `${key}:${value}`)
              .join(";"),
            to: token.offset + token.content.length,
          },
        ]
      : []
  );
  cache.set(node, result);
  return result;
};

const buildDecorations = (doc: PMNode, typeName: string) => {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name !== typeName) {
      return true;
    }
    for (const token of tokenize(node)) {
      decorations.push(
        Decoration.inline(pos + 1 + token.from, pos + 1 + token.to, {
          style: token.style,
        })
      );
    }
    return false;
  });
  return DecorationSet.create(doc, decorations);
};

const highlightKey = new PluginKey<DecorationSet>("codeBlockHighlight");

export const createHighlightPlugin = (typeName: string) =>
  new Plugin<DecorationSet>({
    key: highlightKey,
    props: {
      decorations: (state) => highlightKey.getState(state),
    },
    state: {
      apply: (tr, set) =>
        tr.docChanged || tr.getMeta(highlightKey)
          ? buildDecorations(tr.doc, typeName)
          : set,
      init: (_, { doc }) => buildDecorations(doc, typeName),
    },
    view: (view) => {
      const refresh = () => {
        if (!view.isDestroyed) {
          view.dispatch(view.state.tr.setMeta(highlightKey, true));
        }
      };
      listeners.add(refresh);
      return { destroy: () => listeners.delete(refresh) };
    },
  });
