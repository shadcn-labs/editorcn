import type { Editor } from "@tiptap/core";

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
