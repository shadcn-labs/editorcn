import { setTimeout as sleep } from "node:timers/promises";

import { act, createRef, useState } from "react";
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
import { Input } from "./input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
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

const tooltips = () => document.querySelectorAll<HTMLElement>("[role=tooltip]");

const pointer = async (
  element: HTMLElement | null,
  type: string,
  init: PointerEventInit = {}
) => {
  await act(() => {
    element?.dispatchEvent(
      new PointerEvent(type, { bubbles: true, pointerType: "mouse", ...init })
    );
  });
};

const waitPastGrace = async () => {
  await act(async () => {
    await sleep(150);
  });
};

const Toolbar = ({
  boldLabel = "Bold",
  delay,
  showItalic = true,
}: {
  boldLabel?: string;
  delay?: number;
  showItalic?: boolean;
}) => {
  const [handle] = useState(createTooltipHandle);
  return (
    <TooltipProvider delay={delay}>
      <TooltipHost handle={handle} side="bottom">
        <TooltipTrigger
          handle={handle}
          payload={boldLabel}
          render={<Toggle aria-label="Bold" />}
        />
        {showItalic && (
          <TooltipTrigger
            handle={handle}
            payload="Italic"
            render={<Toggle aria-label="Italic" />}
          />
        )}
      </TooltipHost>
    </TooltipProvider>
  );
};

const hover = async (element: HTMLElement | null) => {
  if (!element) {
    throw new Error("element not found");
  }
  await act(() => {
    element.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" })
    );
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

  it("shares one TooltipHost tooltip between handle triggers", async () => {
    const handle = createTooltipHandle();
    const view = await render(
      <TooltipProvider>
        <TooltipHost handle={handle} side="bottom">
          <TooltipTrigger
            handle={handle}
            payload="Bold"
            render={<Toggle aria-label="Bold" />}
          />
          <TooltipTrigger
            handle={handle}
            payload="Italic"
            render={<Toggle aria-label="Italic" />}
          />
        </TooltipHost>
      </TooltipProvider>
    );
    const bold = view.querySelector<HTMLElement>("button[aria-label=Bold]");
    const italic = view.querySelector<HTMLElement>("button[aria-label=Italic]");
    expect(bold?.dataset.slot).toBe("tooltip-trigger");
    expect(document.querySelector("[role=tooltip]")).toBeNull();

    await hover(bold);
    expect(tooltips()).toHaveLength(1);
    expect(tooltips()[0]?.textContent).toBe("Bold");
    expect(tooltips()[0]?.dataset.side).toBe("bottom");
    expect(bold?.getAttribute("aria-describedby")).toBe(tooltips()[0]?.id);

    await act(() => {
      bold?.dispatchEvent(
        new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse" })
      );
    });
    await hover(italic);
    expect(tooltips()).toHaveLength(1);
    expect(tooltips()[0]?.dataset.state).toBe("delayed-open");
    expect(tooltips()[0]?.textContent).toBe("Italic");
    expect(bold?.hasAttribute("aria-describedby")).toBeFalsy();

    await act(async () => {
      italic?.dispatchEvent(
        new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse" })
      );
      await sleep(150);
    });
    expect(tooltips()).toHaveLength(0);

    await hover(bold);
    expect(tooltips()).toHaveLength(1);
    await act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
      );
    });
    expect(tooltips()).toHaveLength(0);
  });
  it("defaults native Button to type button and keeps explicit types", async () => {
    const view = await render(
      <form>
        <Button>Cancel</Button>
        <Button type="submit">Save</Button>
      </form>
    );
    const [cancel, save] = view.querySelectorAll("button");
    expect(cancel?.getAttribute("type")).toBe("button");
    expect(save?.getAttribute("type")).toBe("submit");
  });

  it("forwards refs from Button and Toggle", async () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const toggleRef = createRef<HTMLButtonElement>();
    await render(
      <>
        <Button ref={buttonRef}>Save</Button>
        <Toggle ref={toggleRef} aria-label="Bold" />
      </>
    );
    expect(buttonRef.current?.tagName).toBe("BUTTON");
    expect(toggleRef.current?.dataset.slot).toBe("toggle");
  });

  it("names the popover from its title and description", async () => {
    await render(
      <Popover open>
        <PopoverContent>
          <PopoverTitle>Edit link</PopoverTitle>
          <PopoverDescription>Paste a URL.</PopoverDescription>
        </PopoverContent>
      </Popover>
    );
    const content = document.querySelector<HTMLElement>(
      "[data-slot=popover-content]"
    );
    const title = document.querySelector("[data-slot=popover-title]");
    const description = document.querySelector(
      "[data-slot=popover-description]"
    );
    expect(title?.id).toBeTruthy();
    expect(content?.getAttribute("aria-labelledby")).toBe(title?.id);
    expect(content?.getAttribute("aria-describedby")).toBe(description?.id);
  });

  it("keeps the tooltip open while the pointer is over it", async () => {
    const view = await render(<Toolbar />);
    const bold = view.querySelector<HTMLElement>("button[aria-label=Bold]");
    await hover(bold);
    await pointer(bold, "pointerout");
    await pointer(tooltips()[0] ?? null, "pointerover");
    await waitPastGrace();
    expect(tooltips()).toHaveLength(1);
    await pointer(tooltips()[0] ?? null, "pointerout");
    await waitPastGrace();
    expect(tooltips()).toHaveLength(0);
  });

  it("updates the open tooltip when the payload changes", async () => {
    const view = await render(<Toolbar />);
    await hover(view.querySelector<HTMLElement>("button[aria-label=Bold]"));
    await act(() => {
      root?.render(<Toolbar boldLabel="Bold (Ctrl+B)" />);
    });
    expect(tooltips()[0]?.textContent).toBe("Bold (Ctrl+B)");
  });

  it("releases the tooltip when its trigger unmounts", async () => {
    const view = await render(<Toolbar />);
    await hover(view.querySelector<HTMLElement>("button[aria-label=Italic]"));
    expect(tooltips()).toHaveLength(1);
    await act(() => {
      root?.render(<Toolbar showItalic={false} />);
    });
    expect(tooltips()).toHaveLength(0);
  });

  it("ignores blur from a trigger that does not own the tooltip", async () => {
    const view = await render(<Toolbar />);
    const bold = view.querySelector<HTMLElement>("button[aria-label=Bold]");
    const italic = view.querySelector<HTMLElement>("button[aria-label=Italic]");
    await act(() => {
      bold?.focus();
    });
    await hover(italic);
    await act(() => {
      bold?.blur();
    });
    await waitPastGrace();
    expect(tooltips()[0]?.textContent).toBe("Italic");
  });

  it("clears the press state on pointercancel", async () => {
    const view = await render(<Toolbar />);
    const bold = view.querySelector<HTMLElement>("button[aria-label=Bold]");
    await pointer(bold, "pointerdown", { pointerId: 7 });
    await pointer(document.body, "pointercancel", { pointerId: 7 });
    await act(() => {
      bold?.focus();
    });
    expect(tooltips()[0]?.textContent).toBe("Bold");
  });

  it("waits for the provider delay before opening on hover", async () => {
    const view = await render(<Toolbar delay={100} />);
    const bold = view.querySelector<HTMLElement>("button[aria-label=Bold]");
    await hover(bold);
    expect(tooltips()).toHaveLength(0);
    await waitPastGrace();
    expect(tooltips()[0]?.textContent).toBe("Bold");
  });

  it("cancels a delayed hover open when the pointer leaves", async () => {
    const view = await render(<Toolbar delay={100} />);
    const bold = view.querySelector<HTMLElement>("button[aria-label=Bold]");
    await hover(bold);
    await pointer(bold, "pointerout");
    await waitPastGrace();
    expect(tooltips()).toHaveLength(0);
  });

  it("opens on keyboard focus without the provider delay", async () => {
    const view = await render(<Toolbar delay={100} />);
    await act(() => {
      view.querySelector<HTMLElement>("button[aria-label=Bold]")?.focus();
    });
    expect(tooltips()[0]?.textContent).toBe("Bold");
  });

  it("defaults a native button render target to type button", async () => {
    const view = await render(
      <form>
        <Button render={<button />}>Cancel</Button>
        <Button render={<button type="submit" />}>Save</Button>
        <Button render={<a href="#top" />}>Top</Button>
      </form>
    );
    const [cancel, save] = view.querySelectorAll("button");
    expect(cancel?.getAttribute("type")).toBe("button");
    expect(save?.getAttribute("type")).toBe("submit");
    expect(view.querySelector("a")?.hasAttribute("type")).toBeFalsy();
  });

  it("forwards the Input ref to the input element", async () => {
    const inputRef = createRef<HTMLInputElement>();
    await render(<Input ref={inputRef} />);
    expect(inputRef.current?.tagName).toBe("INPUT");
  });

  it("falls back to its own tooltip when no host owns the handle", async () => {
    const view = await render(
      <TooltipProvider>
        <TooltipTrigger
          handle={createTooltipHandle()}
          payload="Bold"
          render={<Toggle aria-label="Bold" />}
        />
      </TooltipProvider>
    );
    expect(
      view.querySelector<HTMLElement>("button[aria-label=Bold]")?.dataset.slot
    ).toBe("tooltip-trigger");
  });
});
