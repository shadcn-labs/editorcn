import type { CommandProps, Editor } from "@tiptap/core";
import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";

import { ImagePlaceholderNode } from "./image-placeholder-node";

export { ResizableImage } from "./image";

export interface ImagePlaceholderOptions {
  HTMLAttributes: Record<string, unknown>;
  allowedMimeTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onDrop?: (files: File[], editor: Editor) => void;
  onDropRejected?: (files: File[], editor: Editor) => void;
  onEmbed?: (url: string, editor: Editor) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imagePlaceholder: {
      insertImagePlaceholder: () => ReturnType;
    };
  }
}

export const ImagePlaceholder = Node.create<ImagePlaceholderOptions>({
  addCommands() {
    return {
      insertImagePlaceholder:
        () =>
        ({ commands }: CommandProps) =>
          commands.insertContent({
            type: this.name,
          }),
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholderNode);
  },
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  atom: true,
  group: "block",
  name: "imagePlaceholder",
  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": this.name,
      }),
    ];
  },
});
