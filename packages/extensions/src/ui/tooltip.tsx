"use client";

import { useEffect, useRef } from "react";
import type { FocusEvent, PointerEvent } from "react";

export type TooltipSide = "bottom" | "top";

interface TooltipState {
  arrow: HTMLSpanElement;
  frame: number;
  hideTimer: ReturnType<typeof setTimeout> | null;
  label: HTMLSpanElement;
  removeTimer: ReturnType<typeof setTimeout> | null;
  root: HTMLDivElement;
  side: TooltipSide;
  trigger: HTMLElement | null;
}

const TOOLTIP_ID = "ext-tooltip";
const SIDE_OFFSET = 4;
const VIEWPORT_MARGIN = 8;
const ARROW_INSET = 10;
const CLOSE_DELAY = 80;
const EXIT_DURATION = 150;

const ROOT_CLASS =
  "ext-tooltip pointer-events-none fixed top-0 left-0 z-70 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-2 py-1 text-xs text-background [transition:left_150ms_ease-out,top_150ms_ease-out] data-[instant]:transition-none data-[state=closed]:animate-ext-tooltip-out data-[state=open]:animate-ext-tooltip-in";

const ARROW_CLASS =
  "ext-tooltip-arrow absolute size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-foreground";

let state: TooltipState | null = null;

const ensureState = (): TooltipState => {
  if (state?.root.isConnected) {
    return state;
  }
  const root = document.createElement("div");
  root.id = TOOLTIP_ID;
  root.setAttribute("role", "tooltip");
  root.className = ROOT_CLASS;
  const label = document.createElement("span");
  const arrow = document.createElement("span");
  arrow.className = ARROW_CLASS;
  arrow.setAttribute("aria-hidden", "true");
  root.append(label, arrow);
  state = {
    arrow,
    frame: 0,
    hideTimer: null,
    label,
    removeTimer: null,
    root,
    side: "bottom",
    trigger: null,
  };
  return state;
};

const clearTimers = (current: TooltipState) => {
  if (current.hideTimer) {
    clearTimeout(current.hideTimer);
    current.hideTimer = null;
  }
  if (current.removeTimer) {
    clearTimeout(current.removeTimer);
    current.removeTimer = null;
  }
};

const place = (current: TooltipState) => {
  const { arrow, root, trigger } = current;
  if (!trigger) {
    return;
  }
  const rect = trigger.getBoundingClientRect();
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  const below = rect.bottom + SIDE_OFFSET;
  const above = rect.top - SIDE_OFFSET - height;
  const fitsBelow = below + height <= window.innerHeight - VIEWPORT_MARGIN;
  const fitsAbove = above >= VIEWPORT_MARGIN;
  const side: TooltipSide =
    (current.side === "bottom" && (fitsBelow || !fitsAbove)) ||
    (current.side === "top" && !fitsAbove && fitsBelow)
      ? "bottom"
      : "top";
  const center = rect.left + rect.width / 2;
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(center - width / 2, window.innerWidth - width - VIEWPORT_MARGIN)
  );
  root.style.left = `${left}px`;
  root.style.top = `${side === "bottom" ? below : above}px`;
  root.style.transformOrigin = `${center - left}px ${side === "bottom" ? "0" : "100%"}`;
  root.style.setProperty(
    "--ext-slide-y",
    side === "bottom" ? "-0.5rem" : "0.5rem"
  );
  root.dataset.side = side;
  arrow.style.left = `${Math.max(ARROW_INSET, Math.min(center - left, width - ARROW_INSET))}px`;
  arrow.style.top = side === "bottom" ? "-3px" : "";
  arrow.style.bottom = side === "top" ? "-3px" : "";
};

const hideTooltip = () => {
  const current = state;
  if (!current?.trigger) {
    return;
  }
  clearTimers(current);
  cancelAnimationFrame(current.frame);
  current.trigger.removeAttribute("aria-describedby");
  current.trigger = null;
  current.root.dataset.state = "closed";
  current.removeTimer = setTimeout(() => {
    current.removeTimer = null;
    current.root.remove();
  }, EXIT_DURATION);
};

const follow = (current: TooltipState) => {
  cancelAnimationFrame(current.frame);
  const step = () => {
    if (!current.trigger) {
      return;
    }
    if (!current.trigger.isConnected) {
      hideTooltip();
      return;
    }
    place(current);
    current.frame = requestAnimationFrame(step);
  };
  current.frame = requestAnimationFrame(step);
};

const showTooltip = (trigger: HTMLElement, text: string, side: TooltipSide) => {
  const current = ensureState();
  clearTimers(current);
  const reuse =
    current.trigger !== null &&
    current.root.isConnected &&
    current.root.dataset.state === "open";
  if (current.trigger && current.trigger !== trigger) {
    current.trigger.removeAttribute("aria-describedby");
  }
  current.trigger = trigger;
  current.side = side;
  current.label.textContent = text;
  trigger.setAttribute("aria-describedby", TOOLTIP_ID);
  if (!current.root.isConnected) {
    document.body.append(current.root);
  }
  if (reuse) {
    delete current.root.dataset.instant;
  } else {
    current.root.dataset.instant = "";
    current.root.dataset.state = "closed";
    place(current);
    current.root.getBoundingClientRect();
    current.root.dataset.state = "open";
  }
  place(current);
  follow(current);
};

const scheduleHide = () => {
  const current = state;
  if (!current?.trigger) {
    return;
  }
  if (current.hideTimer) {
    clearTimeout(current.hideTimer);
  }
  current.hideTimer = setTimeout(hideTooltip, CLOSE_DELAY);
};

export interface TooltipTriggerHandlers {
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
}

export const useTooltip = (
  text: string | undefined,
  side: TooltipSide = "bottom"
): TooltipTriggerHandlers | null => {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (text && trigger && state?.trigger === trigger) {
      state.label.textContent = text;
    }
  }, [text]);

  useEffect(
    () => () => {
      if (triggerRef.current && state?.trigger === triggerRef.current) {
        hideTooltip();
      }
    },
    []
  );

  if (!text) {
    return null;
  }

  return {
    onBlur: () => {
      hideTooltip();
    },
    onFocus: (event) => {
      if (event.currentTarget.matches(":focus-visible")) {
        triggerRef.current = event.currentTarget;
        showTooltip(event.currentTarget, text, side);
      }
    },
    onPointerDown: () => {
      hideTooltip();
    },
    onPointerEnter: (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      triggerRef.current = event.currentTarget;
      showTooltip(event.currentTarget, text, side);
    },
    onPointerLeave: () => {
      scheduleHide();
    },
  };
};
