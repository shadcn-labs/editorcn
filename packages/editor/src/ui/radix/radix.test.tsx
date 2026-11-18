import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Toggle } from "./toggle";
import {
  createTooltipHandle,
  TooltipHost,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

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

describe("radix ui primitives", () => {
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

  it("renders Button into the render element", async () => {
    const view = await render(
      <Button variant="ghost" render={<span />}>
        Docs
      </Button>
    );
    const link = view.querySelector<HTMLElement>("span");
    expect(link?.textContent).toBe("Docs");
    expect(link?.dataset.slot).toBe("button");
    expect(link?.className).toContain("hover:bg-muted");
    expect(view.querySelector("button")).toBeNull();
  });

  it("maps pressed and onPressedChange on Toggle", async () => {
    const onPressedChange = vi.fn<(pressed: boolean) => void>();
    const view = await render(
      <Toggle pressed onPressedChange={onPressedChange} aria-label="Bold">
        B
      </Toggle>
    );
    const toggle = view.querySelector("button");
    expect(toggle?.getAttribute("aria-pressed")).toBe("true");
    expect(toggle?.dataset.state).toBe("on");
    await click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(false);
  });

  it("opens Popover from a trigger rendered as a Toggle", async () => {
    const view = await render(
      <Popover>
        <PopoverTrigger render={<Toggle aria-label="Link" />}>
          icon
        </PopoverTrigger>
        <PopoverContent>
          <input aria-label="URL" />
        </PopoverContent>
      </Popover>
    );
    const buttons = view.querySelectorAll("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toBe("icon");
    expect(buttons[0]?.dataset.slot).toBe("popover-trigger");
    await click(buttons[0] ?? null);
    const content = document.querySelector<HTMLElement>(
      "[data-slot=popover-content]"
    );
    expect(content?.dataset.state).toBe("open");
    expect(content?.querySelector("input")).not.toBeNull();
  });

  it("opens Dialog from a render trigger and calls onOpenChange", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const view = await render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger render={<Button aria-label="Embed" />} />
        <DialogContent>
          <DialogTitle>Embed YouTube video</DialogTitle>
          <DialogDescription>Paste a URL.</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    await click(view.querySelector<HTMLElement>("button[aria-label=Embed]"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    const content = document.querySelector<HTMLElement>(
      "[data-slot=dialog-content]"
    );
    expect(content?.dataset.state).toBe("open");
    expect(
      document.querySelector("[data-slot=dialog-title]")?.textContent
    ).toBe("Embed YouTube video");
    expect(
      content?.querySelector("button[data-slot=dialog-close]")
    ).not.toBeNull();
  });

  it("shows the TooltipHost content for a handle trigger", async () => {
    const handle = createTooltipHandle();
    const view = await render(
      <TooltipProvider>
        <TooltipHost handle={handle} side="bottom">
          <TooltipTrigger
            handle={handle}
            payload="Bold"
            render={<Toggle aria-label="Bold" />}
          />
        </TooltipHost>
      </TooltipProvider>
    );
    const trigger = view.querySelector<HTMLElement>("button[aria-label=Bold]");
    expect(trigger?.dataset.slot).toBe("tooltip-trigger");
    await act(() => {
      trigger?.dispatchEvent(new FocusEvent("focus", { bubbles: false }));
      trigger?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });
    const content = document.querySelector<HTMLElement>(
      "[data-slot=tooltip-content]"
    );
    expect(content?.textContent).toContain("Bold");
    expect(content?.dataset.side).toBe("bottom");
  });
});
