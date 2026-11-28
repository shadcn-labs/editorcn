import { setTimeout as sleep } from "node:timers/promises";

import { act, createRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RichTextEditorContext } from "../core/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../primitives/base/dialog";
import {
  createTooltipHandle,
  TooltipHost,
  TooltipProvider,
} from "../primitives/base/tooltip";
import { RichTextEditorControl } from "./control";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const click = async (element: HTMLElement | null) => {
  if (!element) {
    throw new Error("element not found");
  }
  await act(() => {
    element.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, button: 0 })
    );
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    element.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, button: 0 })
    );
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
};

type ContextValue = ComponentProps<
  typeof RichTextEditorContext.Provider
>["value"];

const InToolbar = ({ children }: { children: ReactNode }) => {
  const [tooltip] = useState(createTooltipHandle);
  return (
    <RichTextEditorContext.Provider value={{ tooltip } as ContextValue}>
      <TooltipProvider>
        <TooltipHost handle={tooltip} side="bottom">
          {children}
        </TooltipHost>
      </TooltipProvider>
    </RichTextEditorContext.Provider>
  );
};

const EmbedDialog = ({ title }: { title?: string }) => (
  <Dialog>
    <DialogTrigger
      render={
        <RichTextEditorControl aria-label="Embed" title={title}>
          icon
        </RichTextEditorControl>
      }
    />
    <DialogContent>
      <DialogTitle>Embed YouTube video</DialogTitle>
      <DialogDescription>Paste a URL.</DialogDescription>
    </DialogContent>
  </Dialog>
);

describe("RichTextEditorControl on Base UI", () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  const render = async (node: ReactNode) => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(() => {
      root?.render(node);
    });
    return container;
  };

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
    document.body.innerHTML = "";
  });

  it("forwards its ref to the button", async () => {
    const ref = createRef<HTMLButtonElement>();
    const view = await render(
      <RichTextEditorControl ref={ref} aria-label="Bold" />
    );
    expect(ref.current).toBe(view.querySelector("button"));
  });

  it("passes the click event to onClick", async () => {
    const onClick = vi.fn<(event: { type: string }) => void>();
    const view = await render(
      <RichTextEditorControl aria-label="Bold" onClick={onClick} />
    );
    await click(view.querySelector("button"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0]?.[0].type).toBe("click");
  });

  it("does not add trigger attributes outside a trigger", async () => {
    const view = await render(<RichTextEditorControl aria-label="Bold" />);
    const button = view.querySelector("button");
    expect(button?.hasAttribute("aria-expanded")).toBeFalsy();
    expect(button?.hasAttribute("aria-haspopup")).toBeFalsy();
  });

  it("announces the dialog it opens inside the toolbar tooltip", async () => {
    const view = await render(
      <InToolbar>
        <EmbedDialog title="Embed YouTube video" />
      </InToolbar>
    );
    const button = view.querySelector<HTMLElement>("button[aria-label=Embed]");
    expect(button?.getAttribute("aria-haspopup")).toBe("dialog");
    await click(button);
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    expect(button?.getAttribute("aria-controls")).toBe(
      document.querySelector("[role=dialog]")?.id
    );
  });

  it("announces the dialog it opens", async () => {
    const view = await render(<EmbedDialog />);
    const button = view.querySelector<HTMLElement>("button[aria-label=Embed]");
    expect(button?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button?.getAttribute("aria-expanded")).toBe("false");
    await click(button);
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    const content = document.querySelector("[role=dialog]");
    expect(button?.getAttribute("aria-controls")).toBe(content?.id);
  });

  it("gets focus back when the dialog closes", async () => {
    const view = await render(<EmbedDialog />);
    const button = view.querySelector<HTMLElement>("button[aria-label=Embed]");
    button?.focus();
    await click(button);
    expect(document.querySelector("[role=dialog]")).not.toBeNull();
    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
      );
      await sleep(50);
    });
    expect(document.querySelector("[role=dialog]")).toBeNull();
    expect(document.activeElement).toBe(button);
  });
});
