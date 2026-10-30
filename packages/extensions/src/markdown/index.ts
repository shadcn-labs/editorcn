import type { Editor, JSONContent } from "@tiptap/core";
import { Markdown as TiptapMarkdown } from "@tiptap/markdown";
import type { MarkdownExtensionOptions as TiptapMarkdownOptions } from "@tiptap/markdown";
import type { Mark, Schema } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface MarkdownOptions extends TiptapMarkdownOptions {
  pasteMarkdown: boolean;
}

const MARKDOWN_PATTERN =
  /^(#{1,6}\s|>\s|[-*+]\s|\d+\.\s|```|---\s*$|\|.+\|)|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|!?\[[^\]]*\]\([^)]+\)/m;

export const looksLikeMarkdown = (text: string) => MARKDOWN_PATTERN.test(text);

export const markdownPastePluginKey = new PluginKey("markdownPaste");

const compatible = (marks: Mark[], mark: Mark) =>
  marks.every(
    (other) =>
      !(other.type.excludes(mark.type) || mark.type.excludes(other.type))
  );

export const normalizeMarks = (
  schema: Schema,
  json: JSONContent
): JSONContent => {
  const marks: Mark[] = [];
  const ordered = (json.marks ?? []).toSorted(
    (a, b) =>
      Number(schema.marks[a.type]?.spec.excludes === "_") -
      Number(schema.marks[b.type]?.spec.excludes === "_")
  );
  for (const raw of ordered) {
    const mark = schema.marks[raw.type] && schema.markFromJSON(raw);
    if (mark && compatible(marks, mark)) {
      marks.push(mark);
    }
  }
  return {
    ...json,
    ...(json.marks && { marks: marks.map((mark) => mark.toJSON()) }),
    ...(json.content && {
      content: json.content.map((child) => normalizeMarks(schema, child)),
    }),
  };
};

export const downloadMarkdown = (editor: Editor, filename = "document.md") => {
  const url = URL.createObjectURL(
    new Blob([editor.getMarkdown()], { type: "text/markdown" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const copyMarkdown = (editor: Editor) =>
  navigator.clipboard.writeText(editor.getMarkdown());

export const importMarkdownFile = (editor: Editor) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".md,.markdown,text/markdown,text/plain";
  input.addEventListener("change", async () => {
    const text = await input.files?.[0]?.text();
    if (text !== undefined && !editor.isDestroyed) {
      editor
        .chain()
        .focus()
        .setContent(text, { contentType: "markdown" })
        .run();
    }
  });
  input.click();
};

export const Markdown = TiptapMarkdown.extend<MarkdownOptions>({
  addOptions() {
    return {
      ...(this.parent?.() as TiptapMarkdownOptions),
      pasteMarkdown: false,
    };
  },

  addProseMirrorPlugins() {
    const parent = this.parent?.() ?? [];
    if (!this.options.pasteMarkdown) {
      return parent;
    }
    const { editor } = this;
    return [
      ...parent,
      new Plugin({
        key: markdownPastePluginKey,
        props: {
          handlePaste: (view, event) => {
            const data = event.clipboardData;
            const text = data?.getData("text/plain");
            const fromCodeEditor = data?.types.includes("vscode-editor-data");
            if (
              !text ||
              !editor.markdown ||
              (data?.getData("text/html") && !fromCodeEditor) ||
              view.state.selection.$from.parent.type.spec.code ||
              !looksLikeMarkdown(text)
            ) {
              return false;
            }
            return editor.commands.insertContent(editor.markdown.parse(text));
          },
        },
      }),
    ];
  },

  onBeforeCreate(event) {
    this.parent?.(event);
    const { editor } = this;
    const manager = editor.markdown;
    if (!manager) {
      return;
    }
    const parse = manager.parse.bind(manager);
    manager.parse = (markdown) =>
      normalizeMarks(editor.schema, parse(markdown));
    const { content } = editor.options;
    if (content && typeof content === "object" && !Array.isArray(content)) {
      editor.options.content = normalizeMarks(editor.schema, content);
    }
  },
});
