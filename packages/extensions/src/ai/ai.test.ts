import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Ai, buildAiPrompt, createFetchTransport, getAiState } from ".";
import type { AiRequest, AiTransport } from ".";
import { Markdown } from "../markdown";

let editor: Editor | null = null;

/** A promise that never settles, like a request that hangs. */
const hang = () => Promise.withResolvers<never>().promise;

const partThenHang = async function* partThenHang() {
  yield "Part";
  await hang();
};

const chunks = (...parts: string[]) =>
  (async function* stream() {
    for (const part of parts) {
      await Promise.resolve();
      yield part;
    }
  })();

const create = (
  content: string,
  transport: AiTransport,
  { markdown = false } = {}
) => {
  editor = new Editor({
    content,
    extensions: [
      StarterKit.configure({ trailingNode: false }),
      ...(markdown ? [Markdown] : []),
      Ai.configure({ transport }),
    ],
  });
  return editor;
};

const settle = (target: Editor) =>
  vi.waitFor(() => {
    expect(["done", "error"]).toContain(getAiState(target).status);
  });

const preview = (target: Editor) =>
  target.view.dom.querySelector(".ext-ai-preview");

/** Places the cursor at the end of the first text match, or selects it. */
const select = (target: Editor, text: string, { collapse = false } = {}) => {
  let found = { from: 0, to: 0 };
  target.state.doc.descendants((node, pos) => {
    const index = node.isText ? (node.text ?? "").indexOf(text) : -1;
    if (index !== -1 && found.to === 0) {
      found = { from: pos + index, to: pos + index + text.length };
    }
  });
  target.commands.setTextSelection(
    collapse ? found.to : { from: found.from, to: found.to }
  );
};

describe("ai", () => {
  afterEach(() => {
    editor?.destroy();
    editor = null;
  });

  it("streams into a preview without touching the document", async () => {
    const target = create("<p>Hello</p>", () => chunks("New ", "line"));
    select(target, "Hello", { collapse: true });
    expect(target.commands.aiSubmit({ prompt: "Continue" })).toBeTruthy();
    expect(getAiState(target).status).toBe("streaming");
    await settle(target);
    expect(getAiState(target).text).toBe("New line");
    expect(preview(target)?.textContent).toBe("New line");
    expect(target.getHTML()).toBe("<p>Hello</p>");
  });

  it("inserts below on accept as a single undo step", async () => {
    const target = create("<p>Hello</p>", () => chunks("World"));
    select(target, "Hello", { collapse: true });
    target.commands.aiSubmit({ prompt: "Continue" });
    await settle(target);
    expect(target.commands.aiAccept()).toBeTruthy();
    expect(target.getHTML()).toBe("<p>Hello</p><p>World</p>");
    expect(getAiState(target).status).toBe("idle");
    expect(preview(target)).toBeNull();
    target.commands.undo();
    expect(target.getHTML()).toBe("<p>Hello</p>");
  });

  it("replaces an inline selection inside its paragraph", async () => {
    const target = create("<p>Hello world!</p>", () => "there");
    select(target, "world");
    target.commands.aiSubmit({ prompt: "Rewrite" });
    await settle(target);
    expect(getAiState(target).mode).toBe("replace");
    expect(
      target.view.dom.querySelector(".ext-ai-replacing")?.textContent
    ).toBe("world");
    target.commands.aiAccept();
    expect(target.getHTML()).toBe("<p>Hello there!</p>");
  });

  it("replaces an empty block instead of inserting after it", async () => {
    const target = create("<p>Intro</p><p></p>", () => "Filled");
    target.commands.setTextSelection(target.state.doc.content.size - 1);
    target.commands.aiSubmit({ prompt: "Write" });
    await settle(target);
    target.commands.aiAccept();
    expect(target.getHTML()).toBe("<p>Intro</p><p>Filled</p>");
  });

  it("parses markdown replies when the Markdown extension is installed", async () => {
    const target = create(
      "<p>Notes</p>",
      () => chunks("## Plan\n\n", "- one\n- two"),
      {
        markdown: true,
      }
    );
    select(target, "Notes", { collapse: true });
    target.commands.aiSubmit({ prompt: "Plan" });
    await settle(target);
    expect(preview(target)?.querySelector("h2")?.textContent).toBe("Plan");
    target.commands.aiAccept();
    expect(target.getHTML()).toBe(
      "<p>Notes</p><h2>Plan</h2><ul><li><p>one</p></li><li><p>two</p></li></ul>"
    );
  });

  it("sends the selection and surrounding context", async () => {
    let request: AiRequest | null = null;
    const target = create(
      "<p>Before</p><p>Pick <strong>this</strong></p><p>After</p>",
      (sent) => {
        request = sent;
        return "x";
      },
      { markdown: true }
    );
    select(target, "this");
    target.commands.aiSubmit({ prompt: "Fix", task: "fix-spelling" });
    await settle(target);
    expect(request).toMatchObject({
      mode: "replace",
      prompt: "Fix",
      selection: "**this**",
      task: "fix-spelling",
    });
    const sent = request as AiRequest | null;
    expect(sent?.before).toContain("Before");
    expect(sent?.after).toContain("After");
    expect(sent && buildAiPrompt(sent)).toContain(
      "<selection>\n**this**\n</selection>"
    );
  });

  it("discards the preview and aborts the request", async () => {
    let signal: AbortSignal | null = null;
    const target = create("<p>Hello</p>", (_, options) => {
      ({ signal } = options);
      return hang();
    });
    target.commands.aiSubmit({ prompt: "Continue" });
    await vi.waitFor(() => expect(signal).not.toBeNull());
    expect(target.commands.aiDiscard()).toBeTruthy();
    expect((signal as AbortSignal | null)?.aborted).toBeTruthy();
    expect(getAiState(target).status).toBe("idle");
    expect(target.getHTML()).toBe("<p>Hello</p>");
  });

  it("keeps partial text when stopped and can retry", async () => {
    let calls = 0;
    const target = create("<p>Hello</p>", () => {
      calls += 1;
      return calls === 1 ? partThenHang() : "Full";
    });
    target.commands.aiSubmit({ prompt: "Continue" });
    await vi.waitFor(() => expect(getAiState(target).text).toBe("Part"));
    target.commands.aiStop();
    expect(getAiState(target)).toMatchObject({ status: "done", text: "Part" });
    target.commands.aiRetry();
    await vi.waitFor(() => expect(getAiState(target).text).toBe("Full"));
    expect(calls).toBe(2);
  });

  it("reports transport errors", async () => {
    const onError = vi.fn<(error: unknown) => void>();
    editor = new Editor({
      content: "<p>Hello</p>",
      extensions: [
        StarterKit,
        Ai.configure({
          onError,
          transport: () => Promise.reject(new Error("Rate limited")),
        }),
      ],
    });
    editor.commands.aiSubmit({ prompt: "Continue" });
    await settle(editor);
    expect(getAiState(editor)).toMatchObject({
      error: "Rate limited",
      status: "error",
    });
    expect(onError).toHaveBeenCalledOnce();
    expect(editor.commands.aiAccept()).toBeFalsy();
  });

  it("keeps the target range in place while the document changes", async () => {
    const gate = Promise.withResolvers<boolean>();
    let started = false;
    const target = create("<p>Hello world</p>", () =>
      (async function* gated() {
        started = true;
        await gate.promise;
        yield "there";
      })()
    );
    select(target, "world");
    target.commands.aiSubmit({ prompt: "Rewrite" });
    await vi.waitFor(() => expect(started).toBeTruthy());
    target.commands.insertContentAt(1, "Oh, ");
    gate.resolve(true);
    await settle(target);
    target.commands.aiAccept();
    expect(target.getHTML()).toBe("<p>Oh, Hello there</p>");
  });

  it("does nothing without a transport or prompt", () => {
    const target = create("<p>Hello</p>", () => "x");
    expect(target.commands.aiSubmit({ prompt: "  " })).toBeFalsy();
    expect(target.commands.aiAccept()).toBeFalsy();
    expect(target.commands.aiDiscard()).toBeFalsy();
  });
});

describe(createFetchTransport, () => {
  it("posts the request and streams the response body", async () => {
    const fetcher = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode("Hi "));
              controller.enqueue(encoder.encode("there"));
              controller.close();
            },
          })
        )
      )
    );
    const transport = createFetchTransport({
      api: "/api/ai",
      body: { model: "test-model" },
      fetch: fetcher,
    });
    const target = create("<p>Hello</p>", transport);
    target.commands.aiSubmit({ prompt: "Greet" });
    await settle(target);
    expect(getAiState(target).text).toBe("Hi there");
    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(url).toBe("/api/ai");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: "test-model",
      prompt: "Greet",
    });
  });

  it("surfaces the server's error message", async () => {
    const transport = createFetchTransport({
      api: "/api/ai",
      fetch: () =>
        Promise.resolve(
          Response.json({ error: "Missing API key" }, { status: 401 })
        ),
    });
    const target = create("<p>Hello</p>", transport);
    target.commands.aiSubmit({ prompt: "Greet" });
    await settle(target);
    expect(getAiState(target).error).toBe("Missing API key");
  });
});
