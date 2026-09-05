"use client";

import { Node, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer, useEditorState } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState, useCallback } from "react";

import { RichTextEditorControl } from "../controls/rte-control";
import { ResizableNodeView } from "../extensions/resizable-node-view";
import { useRichTextEditorContext } from "../rte-context";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYouTubeEmbed: (src: string) => ReturnType;
    };
  }
}

const getYouTubeId = (url: string): string | null => {
  const clean = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      return match[1] ?? null;
    }
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(clean) ? clean : null;
};

const YouTubeNodeView = (props: NodeViewProps) => {
  const { node, updateAttributes } = props;
  const rawSrc = node.attrs.src || "";
  const videoId = getYouTubeId(rawSrc) || rawSrc;
  let watchUrl: string | undefined;
  if (videoId) {
    watchUrl = videoId.startsWith("http")
      ? videoId
      : `https://www.youtube.com/watch?v=${videoId}`;
  }

  return (
    <ResizableNodeView
      {...props}
      lockAspect
      aspectRatio={16 / 9}
      minWidth={320}
      maxWidth={1200}
      videoSrc={rawSrc}
      watchUrl={watchUrl}
      onSrcChange={(newSrc) => updateAttributes({ src: newSrc })}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
        className="rte-embed-iframe"
      />
    </ResizableNodeView>
  );
};

export const YouTubeEmbed = Node.create({
  addAttributes() {
    return {
      align: {
        default: "center",
        parseHTML: (el: HTMLElement) => el.dataset.align || "center",
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-align": attrs.align,
        }),
      },
      height: {
        default: 315,
        parseHTML: (el: HTMLElement) =>
          el.dataset.height ? Number(el.dataset.height) : 315,
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-height": attrs.height,
        }),
      },
      src: {
        default: null,
        parseHTML: (el: HTMLElement) => el.dataset.src,
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-src": attrs.src,
        }),
      },
      width: {
        default: 560,
        parseHTML: (el: HTMLElement) =>
          el.dataset.width ? Number(el.dataset.width) : 560,
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-width": attrs.width,
        }),
      },
    };
  },
  addCommands() {
    return {
      setYouTubeEmbed:
        (src: string) =>
        ({ commands }) =>
          commands.insertContent({
            attrs: { src },
            type: "youtube",
          }),
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)?([a-zA-Z0-9_-]{11})/,
        getAttributes: (match: RegExpMatchArray) => ({ src: match[0] }),
        type: this.type,
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(YouTubeNodeView);
  },
  atom: true,
  draggable: true,
  group: "block",
  name: "youtube",
  parseHTML() {
    return [{ tag: 'div[data-type="youtube"]' }];
  },
  renderHTML({ node }: { node: { attrs: Record<string, unknown> } }) {
    return [
      "div",
      {
        "data-align": node.attrs.align,
        "data-height": node.attrs.height,
        "data-src": node.attrs.src,
        "data-type": "youtube",
        "data-width": node.attrs.width,
      },
    ];
  },
});

export const YouTubeEmbedControl = ({ className }: { className?: string }) => {
  const { editor } = useRichTextEditorContext();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const { active } = useEditorState({
    editor: editor ?? null,
    selector: (ctx) => ({
      active:
        ctx.editor && !ctx.editor.isDestroyed
          ? ctx.editor.isActive("youtube")
          : false,
    }),
  }) ?? { active: false };

  const handleInsert = useCallback(() => {
    if (url && editor) {
      editor.chain().focus().setYouTubeEmbed(url).run();
      setUrl("");
    }
  }, [url, editor]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <RichTextEditorControl
            active={active}
            className={className}
            title="Embed YouTube video"
            aria-label="Embed YouTube video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rte-editor-icon"
            >
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8z" />
              <path d="M9.5 15.5V8.5l6.2 3.5z" />
            </svg>
          </RichTextEditorControl>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Embed YouTube video</DialogTitle>
          <DialogDescription>
            Paste a YouTube video URL or ID.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && url) {
              handleInsert();
              setOpen(false);
            }
          }}
        />
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <DialogClose
            disabled={!url}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            onClick={handleInsert}
          >
            Insert
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
