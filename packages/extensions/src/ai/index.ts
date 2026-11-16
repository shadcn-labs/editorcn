import { Extension } from "@tiptap/core";
import type {
  Editor,
  JSONContent,
  KeyboardShortcutCommand,
} from "@tiptap/core";
import { DOMSerializer } from "@tiptap/pm/model";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorState, Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { AI_SYSTEM_PROMPT } from "./prompt";
import { readAiStream } from "./transport";
import type {
  AiMode,
  AiRequest,
  AiState,
  AiSubmitOptions,
  AiTransport,
} from "./types";

export { AI_SYSTEM_PROMPT, DEFAULT_AI_PRESETS, buildAiPrompt } from "./prompt";
export { createFetchTransport, readAiStream } from "./transport";
export type { FetchTransportOptions } from "./transport";
export type {
  AiMode,
  AiPreset,
  AiRequest,
  AiState,
  AiStatus,
  AiStreamSource,
  AiSubmitOptions,
  AiTransport,
} from "./types";

export interface AiOptions {
  /** Sends a request and returns the streamed reply. Required. */
  transport: AiTransport | null;
  /** Sent as `request.system`. Your route decides whether to use it. */
  system: string;
  /** Max characters of context sent on each side of the selection. */
  contextLimit: number;
  /** Escape discards, Mod-Enter accepts. */
  shortcuts: boolean;
  onFinish?: (result: { text: string; request: AiRequest }) => void;
  onError?: (error: unknown, request: AiRequest) => void;
}

export interface AiStorage {
  controller: AbortController | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ai: {
      /** Starts a request. The reply streams into a preview, not the document. */
      aiSubmit: (options: AiSubmitOptions) => ReturnType;
      /** Writes the preview into the document as one undo step. */
      aiAccept: () => ReturnType;
      /** Drops the preview and cancels a running request. */
      aiDiscard: () => ReturnType;
      /** Runs the last request again over the same range. */
      aiRetry: () => ReturnType;
      /** Cancels a running request and keeps what streamed so far. */
      aiStop: () => ReturnType;
    };
  }
  interface Storage {
    ai: AiStorage;
  }
}

interface MarkdownLike {
  parse: (markdown: string) => JSONContent;
  serialize: (content: JSONContent) => string;
}

type AiAction =
  | {
      type: "start";
      from: number;
      to: number;
      mode: AiMode;
      request: AiRequest;
    }
  | { type: "chunk"; text: string }
  | { type: "finish" }
  | { type: "error"; error: string }
  | { type: "clear" };

export const aiPluginKey = new PluginKey<AiState>("ai");

const IDLE: AiState = {
  error: null,
  from: 0,
  mode: "insert",
  request: null,
  status: "idle",
  text: "",
  to: 0,
};

export const getAiState = (editor: Editor): AiState =>
  aiPluginKey.getState(editor.state) ?? IDLE;

const markdownOf = (editor: Editor) =>
  (editor as unknown as { markdown?: MarkdownLike }).markdown;

const serialize = (editor: Editor, doc: PMNode, from: number, to: number) => {
  if (from >= to) {
    return "";
  }
  const manager = markdownOf(editor);
  if (manager) {
    try {
      return manager.serialize(doc.cut(from, to).toJSON()).trim();
    } catch {
      // Fall through to plain text.
    }
  }
  return doc.textBetween(from, to, "\n\n").trim();
};

/** Parses a reply into block nodes, as markdown when the extension exists. */
export const parseAiResult = (editor: Editor, text: string): JSONContent[] => {
  const manager = markdownOf(editor);
  if (manager) {
    try {
      return manager.parse(text).content ?? [];
    } catch {
      // Fall through to plain paragraphs.
    }
  }
  return text
    .split(/\n+/)
    .filter((line) => line.trim() !== "")
    .map((line) => ({
      content: [{ text: line, type: "text" }],
      type: "paragraph",
    }));
};

const resolveRange = (state: EditorState, mode?: AiMode) => {
  const { $from, $to, empty, from, to } = state.selection;
  const block = $from.parent;
  if (
    empty &&
    block.isTextblock &&
    block.content.size === 0 &&
    $from.depth > 0
  ) {
    return {
      from: $from.before(),
      mode: "replace" as const,
      to: $from.after(),
    };
  }
  if ((mode ?? (empty ? "insert" : "replace")) === "replace" && !empty) {
    return { from, mode: "replace" as const, to };
  }
  const at = $to.parent.isTextblock && $to.depth > 0 ? $to.after() : to;
  return { from: at, mode: "insert" as const, to: at };
};

const reduce = (state: AiState, action: AiAction): AiState => {
  switch (action.type) {
    case "start": {
      return {
        error: null,
        from: action.from,
        mode: action.mode,
        request: action.request,
        status: "streaming",
        text: "",
        to: action.to,
      };
    }
    case "chunk": {
      return state.status === "streaming"
        ? { ...state, text: action.text }
        : state;
    }
    case "finish": {
      return state.status === "streaming"
        ? { ...state, status: "done" }
        : state;
    }
    case "error": {
      return state.status === "idle"
        ? state
        : { ...state, error: action.error, status: "error" };
    }
    case "clear": {
      return IDLE;
    }
    default: {
      return state;
    }
  }
};

const mapRange = (state: AiState, tr: Transaction): AiState => {
  if (state.status === "idle" || !tr.docChanged) {
    return state;
  }
  if (state.from === state.to) {
    const at = tr.mapping.mapResult(state.from, -1).pos;
    return { ...state, from: at, to: at };
  }
  const from = tr.mapping.mapResult(state.from, 1).pos;
  return {
    ...state,
    from,
    to: Math.max(from, tr.mapping.mapResult(state.to, -1).pos),
  };
};

const renderPreview = (editor: Editor, state: AiState) => {
  const dom = document.createElement("div");
  dom.className = "ext-ai-preview";
  dom.contentEditable = "false";
  dom.dataset.status = state.status;
  if (!state.text) {
    const note = document.createElement("span");
    note.className =
      state.status === "error"
        ? "ext-ai-preview-error"
        : "ext-ai-preview-loading";
    note.textContent = state.status === "error" ? (state.error ?? "") : "";
    dom.append(note);
    return dom;
  }
  try {
    const doc = editor.schema.nodeFromJSON({
      content: parseAiResult(editor, state.text),
      type: "doc",
    });
    dom.append(
      DOMSerializer.fromSchema(editor.schema).serializeFragment(doc.content)
    );
  } catch {
    dom.textContent = state.text;
  }
  return dom;
};

const decorate = (editor: Editor, state: EditorState) => {
  const ai = aiPluginKey.getState(state);
  if (!ai || ai.status === "idle") {
    return null;
  }
  const { doc } = state;
  const decorations: Decoration[] = [];
  let widgetAt = ai.from;
  if (ai.mode === "replace" && ai.from < ai.to) {
    const node = doc.nodeAt(ai.from);
    const wholeEmptyBlock =
      node?.isTextblock &&
      node.content.size === 0 &&
      ai.from + node.nodeSize === ai.to;
    decorations.push(
      wholeEmptyBlock
        ? Decoration.node(ai.from, ai.to, {
            class: "ext-ai-replacing ext-ai-empty",
          })
        : Decoration.inline(ai.from, ai.to, { class: "ext-ai-replacing" })
    );
    const $to = doc.resolve(ai.to);
    widgetAt = $to.parent.isTextblock && $to.depth > 0 ? $to.after() : ai.to;
  }
  decorations.push(
    Decoration.widget(widgetAt, () => renderPreview(editor, ai), {
      ignoreSelection: true,
      key: `ai-${ai.status}-${ai.text.length}`,
      side: 1,
      stopEvent: () => true,
    })
  );
  return DecorationSet.create(doc, decorations);
};

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "AI request failed.";

export const Ai = Extension.create<AiOptions, AiStorage>({
  addCommands() {
    const send = (action: AiAction) => {
      const { editor } = this;
      if (!editor.isDestroyed) {
        editor.view.dispatch(editor.state.tr.setMeta(aiPluginKey, action));
      }
    };

    const stream = async (request: AiRequest) => {
      const { transport, onError, onFinish } = this.options;
      this.storage.controller?.abort();
      const controller = new AbortController();
      this.storage.controller = controller;
      const live = () =>
        !(controller.signal.aborted || this.editor.isDestroyed);
      let text = "";
      try {
        if (!transport) {
          throw new Error("The Ai extension needs a transport option.");
        }
        const source = await transport(request, { signal: controller.signal });
        for await (const chunk of readAiStream(source)) {
          if (!live()) {
            return;
          }
          text += chunk;
          send({ text, type: "chunk" });
        }
        if (live()) {
          send({ type: "finish" });
          onFinish?.({ request, text });
        }
      } catch (error) {
        if (live()) {
          send({ error: errorText(error), type: "error" });
          onError?.(error, request);
        }
      } finally {
        if (this.storage.controller === controller) {
          this.storage.controller = null;
        }
      }
    };

    const abort = () => {
      this.storage.controller?.abort();
      this.storage.controller = null;
    };

    return {
      aiAccept:
        () =>
        ({ commands, editor, state, tr, dispatch }) => {
          const ai = aiPluginKey.getState(state);
          if (!ai || ai.status === "idle" || ai.text.trim() === "") {
            return false;
          }
          const blocks = parseAiResult(editor, ai.text);
          if (blocks.length === 0) {
            return false;
          }
          if (!dispatch) {
            return true;
          }
          abort();
          const [first] = blocks;
          const $from = state.doc.resolve(ai.from);
          const inline =
            ai.from < ai.to &&
            blocks.length === 1 &&
            first?.type === "paragraph" &&
            $from.parent.isTextblock &&
            $from.sameParent(state.doc.resolve(ai.to));
          tr.setMeta(aiPluginKey, { type: "clear" });
          return commands.insertContentAt(
            { from: ai.from, to: ai.to },
            inline ? (first.content ?? []) : blocks
          );
        },

      aiDiscard:
        () =>
        ({ state, tr, dispatch }) => {
          if ((aiPluginKey.getState(state)?.status ?? "idle") === "idle") {
            return false;
          }
          if (dispatch) {
            abort();
            tr.setMeta(aiPluginKey, { type: "clear" });
          }
          return true;
        },

      aiRetry:
        () =>
        ({ state, tr, dispatch }) => {
          const ai = aiPluginKey.getState(state);
          if (!ai?.request || ai.status === "idle") {
            return false;
          }
          if (dispatch) {
            const { from, mode, request, to } = ai;
            tr.setMeta(aiPluginKey, { from, mode, request, to, type: "start" });
            queueMicrotask(() => {
              stream(request);
            });
          }
          return true;
        },

      aiStop:
        () =>
        ({ state, tr, dispatch }) => {
          const ai = aiPluginKey.getState(state);
          if (ai?.status !== "streaming") {
            return false;
          }
          if (dispatch) {
            abort();
            tr.setMeta(
              aiPluginKey,
              ai.text ? { type: "finish" } : { type: "clear" }
            );
          }
          return true;
        },

      aiSubmit:
        (options) =>
        ({ editor, state, tr, dispatch }) => {
          if (!(this.options.transport && options.prompt.trim())) {
            return false;
          }
          if (!dispatch) {
            return true;
          }
          const { from, mode, to } = resolveRange(state, options.mode);
          const { doc } = state;
          const limit = this.options.contextLimit;
          const selection = state.selection.empty
            ? ""
            : serialize(editor, doc, state.selection.from, state.selection.to);
          const request: AiRequest = {
            after: serialize(editor, doc, to, doc.content.size).slice(0, limit),
            before: serialize(editor, doc, 0, from).slice(-limit),
            data: options.data,
            mode,
            prompt: options.prompt.trim(),
            selection,
            system: options.system ?? this.options.system,
            task: options.task,
          };
          tr.setMeta(aiPluginKey, { from, mode, request, to, type: "start" });
          queueMicrotask(() => {
            stream(request);
          });
          return true;
        },
    };
  },

  addKeyboardShortcuts(): Record<string, KeyboardShortcutCommand> {
    if (!this.options.shortcuts) {
      return {};
    }
    return {
      Escape: ({ editor }) => editor.commands.aiDiscard(),
      "Mod-Enter": ({ editor }) =>
        getAiState(editor).status === "done" && editor.commands.aiAccept(),
    };
  },

  addOptions() {
    return {
      contextLimit: 8000,
      onError: undefined,
      onFinish: undefined,
      shortcuts: true,
      system: AI_SYSTEM_PROMPT,
      transport: null,
    };
  },

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin<AiState>({
        key: aiPluginKey,
        props: {
          decorations: (state) => decorate(editor, state),
        },
        state: {
          apply: (tr, value) => {
            const action = tr.getMeta(aiPluginKey) as AiAction | undefined;
            const mapped = mapRange(value, tr);
            return action ? reduce(mapped, action) : mapped;
          },
          init: () => IDLE,
        },
      }),
    ];
  },

  addStorage() {
    return { controller: null };
  },

  name: "ai",

  onDestroy() {
    this.storage.controller?.abort();
    this.storage.controller = null;
  },
});
