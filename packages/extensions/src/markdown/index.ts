import type { Editor } from "@tiptap/core";
import { Markdown as TiptapMarkdown } from "@tiptap/markdown";
import type { MarkdownExtensionOptions as TiptapMarkdownOptions } from "@tiptap/markdown";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface MarkdownOptions extends TiptapMarkdownOptions {
  pasteMarkdown: boolean;
}

const MARKDOWN_PATTERN =
  /^(#{1,6}\s|>\s|[-*+]\s|\d+\.\s|```|---\s*$|\|.+\|)|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|!?\[[^\]]*\]\([^)]+\)/m;

export const looksLikeMarkdown = (text: string) => MARKDOWN_PATTERN.test(text);

export const markdownPastePluginKey = new PluginKey("markdownPaste");

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
});
