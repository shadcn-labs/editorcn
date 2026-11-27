import { useLayoutEffect, useRef } from "react";

import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorToolbarProps } from "./types";
import { cn } from "./ui/utils";

// Groups draw their separator before themselves, so when the toolbar wraps,
// the first group on each new row would start with a stray separator. CSS
// can't tell which flex item starts a line, so mark those groups here. The
// marker only makes the separator invisible (it keeps its width), so marking
// never changes the layout it was computed from and can't oscillate.
const GROUPS = ":scope > .rte-controls-group";

const useMarkLineStarts = (enabled: boolean) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const toolbar = ref.current;
    if (!enabled || !toolbar || typeof ResizeObserver === "undefined") {
      return;
    }
    const mark = () => {
      let previous: DOMRect | null = null;
      for (const group of toolbar.querySelectorAll<HTMLElement>(GROUPS)) {
        if (group.getClientRects().length === 0) {
          continue;
        }
        const rect = group.getBoundingClientRect();
        const startsLine = previous !== null && rect.top >= previous.bottom - 1;
        group.toggleAttribute("data-line-start", startsLine);
        previous = rect;
      }
    };
    // Watch the toolbar and every group, so controls appearing or resizing
    // inside a group re-mark rows even when the toolbar's size stays the same.
    const resize = new ResizeObserver(mark);
    const observeAll = () => {
      resize.disconnect();
      resize.observe(toolbar);
      for (const group of toolbar.querySelectorAll<HTMLElement>(GROUPS)) {
        resize.observe(group);
      }
    };
    // Only child list changes: the marker attribute never re-triggers this.
    const mutation = new MutationObserver(() => {
      observeAll();
      mark();
    });
    mutation.observe(toolbar, { childList: true });
    observeAll();
    mark();
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [enabled]);

  return ref;
};

export const Toolbar = ({
  children,
  className,
  sticky,
  stickyOffset = 0,
}: RichTextEditorToolbarProps) => {
  const { variant, editable } = useRichTextEditorContext();
  const ref = useMarkLineStarts(editable);

  if (!editable) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rte-toolbar top-[var(--rte-sticky-offset,0px)] z-1 flex flex-wrap items-center justify-center gap-1 rounded-ss-[calc(var(--radius)+3px)] rounded-se-[calc(var(--radius)+3px)] border-b border-(--rte-hairline) bg-(--rte-strip) px-2 py-1.5 [transition:background-color_150ms_ease-out]",
        "[@media(max-width:640px)]:justify-start [@media(max-width:640px)]:flex-nowrap [@media(max-width:640px)]:overflow-x-auto [@media(max-width:640px)]:[--rte-toolbar-fade-end:1.5rem] [@media(max-width:640px)]:[-ms-overflow-style:none] [@media(max-width:640px)]:[-webkit-overflow-scrolling:touch] [@media(max-width:640px)]:[mask-image:linear-gradient(to_right,transparent,black_var(--rte-toolbar-fade-start),black_calc(100%-var(--rte-toolbar-fade-end)),transparent)] [@media(max-width:640px)]:[scrollbar-width:none] [@media(max-width:640px)]:[&::-webkit-scrollbar]:hidden [@media(max-width:640px)]:supports-[animation-timeline:scroll()]:[--rte-toolbar-fade-end:0px] [@media(max-width:640px)]:supports-[animation-timeline:scroll()]:animate-rte-toolbar-fade [@media(max-width:640px)]:supports-[animation-timeline:scroll()]:[animation-timeline:scroll(self_inline)]",
        variant !== "default" && `rte-toolbar--${variant}`,
        variant === "default" &&
          "gap-1 rounded-none border-b-0 bg-transparent px-0 pt-0 pb-1",
        variant === "subtle" && "gap-1 px-1.5 py-1",
        variant === "compact" &&
          "gap-0.5 rounded-none px-1.5 py-1 first:rounded-ss-[calc(var(--radius)-1px)] first:rounded-se-[calc(var(--radius)-1px)]",
        sticky &&
          "sticky bg-[color-mix(in_srgb,var(--rte-strip)_80%,transparent)] backdrop-blur-lg",
        sticky &&
          variant === "default" &&
          "-mx-1 -mt-1 rounded-ss-[calc(var(--radius)+3px)] rounded-se-[calc(var(--radius)+3px)] bg-[color-mix(in_srgb,var(--rte-strip)_85%,transparent)] p-1",
        className
      )}
      data-sticky={sticky ? "" : undefined}
      style={sticky ? { top: stickyOffset } : undefined}
    >
      {children}
    </div>
  );
};
