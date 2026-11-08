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

// Kept only on task lists and callouts, so they still parse when pasted from other Tiptap pages.
const TASK_ATTRIBUTES = new Set(["data-checked", "data-type"]);
const TASK_TYPE = /^task(List|Item)$/;
const CALLOUT_ATTRIBUTES = new Set(["data-emoji", "data-type", "data-variant"]);

const decoration = ({ style }: HTMLElement) =>
  `${style.textDecoration} ${style.textDecorationLine}`;

// Each test returns true (sets the format), false (resets it), or undefined
// (not specified here, so the nearest ancestor decides).
const STYLE_TAGS: [string, (element: HTMLElement) => boolean | undefined][] = [
  [
    "strong",
    ({ style }) =>
      style.fontWeight
        ? /^(bold|bolder|[6-9]00)$/.test(style.fontWeight)
        : undefined,
  ],
  [
    "em",
    ({ style }) =>
      style.fontStyle ? /^(italic|oblique)/.test(style.fontStyle) : undefined,
  ],
  // Text decorations can't be reset by a child in CSS, so they only ever add.
  [
    "u",
    (element) =>
      (decoration(element).includes("underline") && !element.closest("a")) ||
      undefined,
  ],
  ["s", (element) => decoration(element).includes("line-through") || undefined],
  [
    "sub",
    ({ style }) =>
      style.verticalAlign ? style.verticalAlign === "sub" : undefined,
  ],
  [
    "sup",
    ({ style }) =>
      style.verticalAlign ? style.verticalAlign === "super" : undefined,
  ],
];

const MSO_LIST = /mso-list:\s*l(\d+)\s+level(\d+)/i;
const MSO_IGNORE = /mso-list:\s*ignore/i;
const ORDERED_MARKER = /^\w+[.)]$/;
// Word supports nine list levels; clamping also guards against huge values.
const MAX_LIST_DEPTH = 9;

// Removes Word's typed bullet/number and reports the list it implies.
const takeListMarker = (paragraph: HTMLElement) => {
  const marker = [
    ...paragraph.querySelectorAll<HTMLElement>("span[style]"),
  ].find((span) => MSO_IGNORE.test(span.getAttribute("style") ?? ""));
  const text = marker?.textContent?.trim() ?? "";
  marker?.remove();
  return {
    start: Number.parseInt(text, 10),
    tag: ORDERED_MARKER.test(text) ? "ol" : "ul",
  };
};

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
    const depth = Math.min(Math.max(Number(level), 1), MAX_LIST_DEPTH);
    const { start, tag } = takeListMarker(paragraph);

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
      if (list.localName === "ol" && start > 1) {
        list.setAttribute("start", String(start));
      }
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

// Wraps each text node in the formatting its nearest styled ancestors give it,
// so a reset like font-weight:normal inside a bold span stays plain.
const convertStyleTags = (body: HTMLElement) => {
  const walker = body.ownerDocument.createTreeWalker(
    body,
    NodeFilter.SHOW_TEXT
  );
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }
  for (const text of textNodes) {
    if (!text.data.trim()) {
      continue;
    }
    let node: ChildNode = text;
    for (const [tag, test] of STYLE_TAGS) {
      let active: boolean | undefined;
      for (
        let element = text.parentElement;
        element && element !== body && active === undefined;
        element = element.parentElement
      ) {
        active = test(element);
      }
      if (active) {
        const wrapper = body.ownerDocument.createElement(tag);
        node.before(wrapper);
        wrapper.append(node);
        node = wrapper;
      }
    }
  }
};

const keptDataAttributes = (element: HTMLElement) => {
  const { type = "" } = element.dataset;
  if (TASK_TYPE.test(type)) {
    return TASK_ATTRIBUTES;
  }
  if (type === "callout" && element.tagName === "DIV") {
    return CALLOUT_ATTRIBUTES;
  }
  return null;
};

const cleanAttributes = (element: HTMLElement) => {
  const { whiteSpace } = element.style;
  const kept = keptDataAttributes(element);
  for (const name of element.getAttributeNames()) {
    if (!(ALLOWED_ATTRIBUTES.has(name) || kept?.has(name))) {
      element.removeAttribute(name);
    }
  }
  // The editor keeps spaces and line breaks only while this style is present.
  if (whiteSpace.startsWith("pre")) {
    element.setAttribute("style", `white-space: ${whiteSpace}`);
  }
};

export const cleanPastedHtml = (html: string, options: PasteCleanupOptions) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (doc.querySelector("[data-pm-slice]")) {
    return html;
  }

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
    convertStyleTags(doc.body);
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
