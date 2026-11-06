import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface PasteCleanupOptions {
  convertWord: boolean;
  removeEmptyParagraphs: boolean;
  stripStyles: boolean;
}

export const pasteCleanupPluginKey = new PluginKey("pasteCleanup");

const ALLOWED_ATTRIBUTES = new Set([
  "alt",
  "colspan",
  "height",
  "href",
  "rowspan",
  "src",
  "start",
  "title",
  "width",
]);

const decoration = ({ style }: HTMLElement) =>
  `${style.textDecoration} ${style.textDecorationLine}`;

const STYLE_TAGS: [string, (element: HTMLElement) => boolean][] = [
  ["strong", ({ style }) => /^(bold|bolder|[6-9]00)$/.test(style.fontWeight)],
  ["em", ({ style }) => /^(italic|oblique)/.test(style.fontStyle)],
  [
    "u",
    (element) =>
      decoration(element).includes("underline") && !element.closest("a"),
  ],
  ["s", (element) => decoration(element).includes("line-through")],
  ["sub", ({ style }) => style.verticalAlign === "sub"],
  ["sup", ({ style }) => style.verticalAlign === "super"],
];

const MSO_LIST = /mso-list:\s*l(\d+)\s+level(\d+)/i;
const ORDERED_MARKER = /^\w+[.)]$/;

const convertWordLists = (doc: Document) => {
  let stack: HTMLElement[] = [];
  let lastId: string | undefined;
  for (const paragraph of doc.querySelectorAll<HTMLElement>(
    "p[style*='mso-list']"
  )) {
    const match = MSO_LIST.exec(paragraph.getAttribute("style") ?? "");
    if (!match) {
      continue;
    }
    const [, id, level] = match;
    const depth = Number(level);
    const marker = paragraph.querySelector("span[style*='mso-list:Ignore']");
    const tag = ORDERED_MARKER.test(marker?.textContent?.trim() ?? "")
      ? "ol"
      : "ul";
    marker?.remove();

    if (paragraph.previousElementSibling !== stack[0] || id !== lastId) {
      stack = [];
    }
    lastId = id;
    stack.length = Math.min(stack.length, depth);
    if (stack.length === depth && stack.at(-1)?.tagName.toLowerCase() !== tag) {
      stack.pop();
    }
    while (stack.length < depth) {
      const list = doc.createElement(stack.length === depth - 1 ? tag : "ul");
      const parent = stack.at(-1);
      if (parent) {
        (parent.lastElementChild ?? parent).append(list);
      } else {
        paragraph.before(list);
      }
      stack.push(list);
    }
    const item = doc.createElement("li");
    stack.at(-1)?.append(item);
    item.append(paragraph);
  }
};

const cleanAttributes = (element: HTMLElement) => {
  const tags = STYLE_TAGS.filter(([, test]) => test(element));
  for (const name of element.getAttributeNames()) {
    if (!ALLOWED_ATTRIBUTES.has(name)) {
      element.removeAttribute(name);
    }
  }
  for (const [tag] of tags) {
    const wrapper = element.ownerDocument.createElement(tag);
    wrapper.append(...element.childNodes);
    element.append(wrapper);
  }
};

export const cleanPastedHtml = (html: string, options: PasteCleanupOptions) => {
  if (html.includes("data-pm-slice")) {
    return html;
  }
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (options.convertWord) {
    convertWordLists(doc);
  }
  for (const wrapper of doc.querySelectorAll("b[id^='docs-internal-guid']")) {
    wrapper.replaceWith(...wrapper.childNodes);
  }
  if (options.removeEmptyParagraphs) {
    for (const br of doc.querySelectorAll("body > br")) {
      br.remove();
    }
    for (const paragraph of doc.querySelectorAll("p")) {
      if (!(paragraph.textContent?.trim() || paragraph.querySelector("img"))) {
        paragraph.remove();
      }
    }
  }
  if (options.stripStyles) {
    for (const element of doc.body.querySelectorAll<HTMLElement>("*")) {
      cleanAttributes(element);
    }
  }
  return doc.body.innerHTML;
};

export const PasteCleanup = Extension.create<PasteCleanupOptions>({
  addOptions() {
    return {
      convertWord: true,
      removeEmptyParagraphs: true,
      stripStyles: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pasteCleanupPluginKey,
        props: {
          transformPastedHTML: (html) => cleanPastedHtml(html, this.options),
        },
      }),
    ];
  },

  name: "pasteCleanup",
});
