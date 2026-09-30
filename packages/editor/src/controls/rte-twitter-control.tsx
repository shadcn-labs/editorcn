"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@editorcn/editor-ui/editor";
import { Node, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer, useEditorState } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState, useCallback, useEffect, useRef } from "react";

import { RichTextEditorControl } from "../controls/rte-control";
import { ResizableNodeView } from "../extensions/resizable-node-view";
import { useRichTextEditorContext } from "../rte-context";

const WIDGET_SCRIPT_URL = "https://platform.twitter.com/widgets.js";
const SCRIPT_LOAD_TIMEOUT_MS = 8000;
const READY_POLL_INTERVAL_MS = 50;

let twitterScriptPromise: Promise<void> | null = null;

const loadTwitterScript = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.twttr?.widgets) {
    return Promise.resolve();
  }
  if (twitterScriptPromise) {
    return twitterScriptPromise;
  }

  // eslint-disable-next-line promise/avoid-new
  twitterScriptPromise = new Promise<void>((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SCRIPT_URL}"]`
    );
    const isNewScript = !script;
    if (!script) {
      script = document.createElement("script");
      script.src = WIDGET_SCRIPT_URL;
      script.async = true;
      document.body.append(script);
    }

    let settled = false;
    const timers: {
      poll?: ReturnType<typeof setInterval>;
      timeout?: ReturnType<typeof setTimeout>;
    } = {};

    const cleanup = () => {
      clearInterval(timers.poll);
      clearTimeout(timers.timeout);
    };

    const succeed = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };

    const fail = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      twitterScriptPromise = null;
      reject(new Error("Failed to load Twitter widgets script"));
    };

    if (window.twttr?.widgets) {
      succeed();
      return;
    }

    timers.poll = setInterval(() => {
      if (window.twttr?.widgets) {
        succeed();
      }
    }, READY_POLL_INTERVAL_MS);

    timers.timeout = setTimeout(fail, SCRIPT_LOAD_TIMEOUT_MS);

    if (isNewScript) {
      script.addEventListener(
        "load",
        () => {
          if (window.twttr?.widgets) {
            succeed();
          }
          // If widgets isn't attached yet, the poll above will pick it up.
        },
        { once: true }
      );
    }

    script.addEventListener("error", fail, { once: true });
  });

  return twitterScriptPromise;
};

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        createTweet: (
          tweetId: string,
          container: HTMLElement
        ) => Promise<unknown>;
      };
    };
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    twitter: {
      setTwitterEmbed: (tweetId: string) => ReturnType;
    };
  }
}

const TwitterNodeView = (props: NodeViewProps) => {
  const { node } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const { tweetId } = node.attrs;
  const renderedTweetIdRef = useRef<string | null>(null);
  const activeRenderIdRef = useRef(0);

  const retryToken = useRef(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !tweetId) {
      return;
    }

    if (
      renderedTweetIdRef.current === tweetId &&
      containerRef.current.children.length > 0 &&
      !failed
    ) {
      setLoading(false);
      return;
    }

    let isCancelled = false;
    activeRenderIdRef.current += 1;
    const renderId = activeRenderIdRef.current;
    setLoading(true);
    setFailed(false);

    const render = async () => {
      try {
        await loadTwitterScript();
        if (
          isCancelled ||
          renderId !== activeRenderIdRef.current ||
          !containerRef.current
        ) {
          return;
        }

        const { twttr } = window;
        if (!twttr?.widgets) {
          throw new Error("Twitter widgets script unavailable");
        }

        containerRef.current.innerHTML = "";
        const el = await twttr.widgets.createTweet(
          tweetId,
          containerRef.current
        );

        if (
          isCancelled ||
          renderId !== activeRenderIdRef.current ||
          !containerRef.current
        ) {
          if (el && typeof (el as HTMLElement).remove === "function") {
            (el as HTMLElement).remove();
          } else if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }
          return;
        }

        if (!el) {
          throw new Error("Tweet could not be embedded");
        }

        // Safety guard: ensure only one tweet element remains in the container
        while (containerRef.current.children.length > 1) {
          containerRef.current.firstElementChild?.remove();
        }

        renderedTweetIdRef.current = tweetId;
      } catch {
        if (!isCancelled && renderId === activeRenderIdRef.current) {
          setFailed(true);
          renderedTweetIdRef.current = null;
        }
      } finally {
        if (!isCancelled && renderId === activeRenderIdRef.current) {
          setLoading(false);
        }
      }
    };

    void render();

    return () => {
      isCancelled = true;
    };
  }, [tweetId, retryCount, failed]);

  const handleRetry = useCallback(() => {
    retryToken.current += 1;
    setRetryCount(retryToken.current);
  }, []);

  return (
    <ResizableNodeView
      {...props}
      lockAspect={false}
      minWidth={300}
      maxWidth={1200}
    >
      {loading && <div className="rte-embed-loading">Loading tweet...</div>}
      {!loading && failed && (
        <div className="rte-embed-error">
          <p>Couldn&apos;t load this tweet.</p>
          <button type="button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
      <div ref={containerRef} />
    </ResizableNodeView>
  );
};

export const TwitterEmbed = Node.create({
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
        default: 400,
        parseHTML: (el: HTMLElement) =>
          el.dataset.height ? Number(el.dataset.height) : 400,
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-height": attrs.height,
        }),
      },
      tweetId: {
        default: null,
        parseHTML: (el: HTMLElement) => el.dataset.tweetId,
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-tweet-id": attrs.tweetId,
        }),
      },
      width: {
        default: 550,
        parseHTML: (el: HTMLElement) =>
          el.dataset.width ? Number(el.dataset.width) : 550,
        renderHTML: (attrs: Record<string, unknown>) => ({
          "data-width": attrs.width,
        }),
      },
    };
  },
  addCommands() {
    return {
      setTwitterEmbed:
        (tweetId: string) =>
        ({ commands }) =>
          commands.insertContent({
            attrs: { tweetId },
            type: "twitter",
          }),
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
        getAttributes: (match: RegExpMatchArray) => ({ tweetId: match[1] }),
        type: this.type,
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TwitterNodeView);
  },
  atom: true,
  draggable: true,
  group: "block",
  name: "twitter",
  parseHTML() {
    return [{ tag: 'div[data-type="twitter"]' }];
  },
  renderHTML({ node }: { node: { attrs: Record<string, unknown> } }) {
    return [
      "div",
      {
        "data-align": node.attrs.align,
        "data-height": node.attrs.height,
        "data-tweet-id": node.attrs.tweetId,
        "data-type": "twitter",
        "data-width": node.attrs.width,
      },
    ];
  },
});

const extractTweetId = (input: string): string | null => {
  const clean = input.trim();
  const match = clean.match(
    /(?:twitter\.com|x\.com)\/(?:\w+\/status\/|i\/web\/status\/)(\d+)/
  );
  if (match) {
    return match[1] ?? null;
  }
  return /^\d+$/.test(clean) ? clean : null;
};

export const TwitterEmbedControl = ({ className }: { className?: string }) => {
  const { editor } = useRichTextEditorContext();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);

  const { active } = useEditorState({
    editor: editor ?? null,
    selector: (ctx) => ({
      active:
        ctx.editor && !ctx.editor.isDestroyed
          ? ctx.editor.isActive("twitter")
          : false,
    }),
  }) ?? { active: false };

  const tweetId = url ? extractTweetId(url) : null;
  const showError = touched && url.length > 0 && !tweetId;

  const resetState = useCallback(() => {
    setUrl("");
    setTouched(false);
  }, []);

  const handleInsert = useCallback(() => {
    setTouched(true);
    if (!tweetId || !editor) {
      return false;
    }
    editor.chain().focus().setTwitterEmbed(tweetId).run();
    resetState();
    return true;
  }, [tweetId, editor, resetState]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          resetState();
        }
      }}
    >
      <DialogTrigger
        render={
          <RichTextEditorControl
            active={active}
            className={className}
            title="Embed Tweet"
            aria-label="Embed Tweet"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="rte-editor-icon"
            >
              <path d="M18.2 3.2h3.3l-7.2 8.2 8.5 11.2h-6.6l-5.2-6.8-6 6.8H2.7l7.7-8.8L2.3 3.2h6.8l4.7 6.2 5.4-6.2zm-1.2 17.3h1.8L7 4.8H5.1l11.9 15.7z" />
            </svg>
          </RichTextEditorControl>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed Tweet</DialogTitle>
          <DialogDescription>Paste a tweet URL or ID.</DialogDescription>
        </DialogHeader>
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (touched) {
              setTouched(false);
            }
          }}
          onBlur={() => setTouched(true)}
          placeholder="https://x.com/user/status/..."
          aria-invalid={showError}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url && handleInsert()) {
              setOpen(false);
            }
          }}
        />
        {showError && (
          <p className="rte-input-error" role="alert">
            That doesn&apos;t look like a valid tweet URL or ID.
          </p>
        )}
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <button
            type="button"
            disabled={!url}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            onClick={() => {
              if (handleInsert()) {
                setOpen(false);
              }
            }}
          >
            Insert
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
