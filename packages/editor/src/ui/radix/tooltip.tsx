"use client";

import {
  arrow as arrowMiddleware,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";
import type { Placement } from "@floating-ui/dom";
import { Slot, Tooltip as TooltipPrimitive } from "radix-ui";
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentProps,
  FocusEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "../utils";
import { withRender } from "./render";
import type { RenderProps } from "./render";

const SWITCH_GRACE_MS = 100;

const TOOLTIP_CLASS =
  "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md bg-foreground px-2 py-1 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95";

const ARROW_CLASS =
  "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5";

const TooltipDelayContext = createContext(0);

const TooltipProvider = ({
  delay = 0,
  ...props
}: Omit<ComponentProps<typeof TooltipPrimitive.Provider>, "delayDuration"> & {
  delay?: number;
}) => (
  <TooltipDelayContext.Provider value={delay}>
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delay}
      {...props}
    />
  </TooltipDelayContext.Provider>
);

const Tooltip = ({
  ...props
}: ComponentProps<typeof TooltipPrimitive.Root>) => (
  <TooltipPrimitive.Root data-slot="tooltip" {...props} />
);

const TooltipContent = ({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: Omit<ComponentProps<typeof TooltipPrimitive.Content>, "asChild">) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn(TOOLTIP_CLASS, className)}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className={ARROW_CLASS} />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
);

type Side = "top" | "right" | "bottom" | "left";

type Align = "start" | "center" | "end";

interface TooltipHostOptions {
  className?: string;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
}

interface TooltipHandle {
  readonly kind: "tooltip-handle";
}

interface TooltipHostApi {
  handle: TooltipHandle;
  show: (anchor: HTMLElement, payload: string) => void;
  hide: (anchor: HTMLElement | null) => void;
  close: () => void;
  isOpen: () => boolean;
  keepOpen: () => void;
  update: (anchor: HTMLElement, payload: string) => void;
  release: (anchor: HTMLElement) => void;
}

interface TooltipHostState {
  anchor: HTMLElement | null;
  payload: string;
  open: boolean;
}

const createTooltipHandle = (): TooltipHandle => ({ kind: "tooltip-handle" });

const TooltipHostContext = createContext<TooltipHostApi | null>(null);

const ORIGIN: Record<Side, string> = {
  bottom: "top center",
  left: "center right",
  right: "center left",
  top: "bottom center",
};

const SharedTooltip = ({
  state,
  options,
  onExited,
  onEscape,
  onPointerEnter,
  onPointerLeave,
}: {
  state: TooltipHostState;
  options: TooltipHostOptions;
  onExited: () => void;
  onEscape: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) => {
  const id = useId();
  const floatingRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const {
    align = "center",
    alignOffset = 0,
    className,
    side = "top",
    sideOffset = 4,
  } = options;
  const { anchor, open, payload } = state;

  useLayoutEffect(() => {
    const floating = floatingRef.current;
    const arrowElement = arrowRef.current;
    if (!(anchor && floating && arrowElement)) {
      return;
    }
    const placement = (
      align === "center" ? side : `${side}-${align}`
    ) as Placement;
    const update = async () => {
      const result = await computePosition(anchor, floating, {
        middleware: [
          offset({ crossAxis: alignOffset, mainAxis: sideOffset }),
          flip(),
          shift({ padding: 4 }),
          arrowMiddleware({ element: arrowElement }),
        ],
        placement,
        strategy: "fixed",
      });
      const resolvedSide = result.placement.split("-")[0] as Side;
      floating.style.left = `${result.x}px`;
      floating.style.top = `${result.y}px`;
      floating.style.setProperty(
        "--radix-tooltip-content-transform-origin",
        ORIGIN[resolvedSide]
      );
      floating.dataset.side = resolvedSide;
      arrowElement.dataset.side = resolvedSide;
      const arrowData = result.middlewareData.arrow;
      arrowElement.style.left =
        arrowData?.x === undefined ? "" : `${arrowData.x}px`;
      arrowElement.style.top =
        arrowData?.y === undefined ? "" : `${arrowData.y}px`;
    };
    return autoUpdate(anchor, floating, update);
  }, [anchor, align, alignOffset, side, sideOffset]);

  useEffect(() => {
    if (!(anchor && open)) {
      return;
    }
    const previous = anchor.getAttribute("aria-describedby");
    anchor.setAttribute(
      "aria-describedby",
      previous ? `${previous} ${id}` : id
    );
    return () => {
      const remaining = (anchor.getAttribute("aria-describedby") ?? "")
        .split(" ")
        .filter((token) => token && token !== id)
        .join(" ");
      if (remaining) {
        anchor.setAttribute("aria-describedby", remaining);
      } else {
        anchor.removeAttribute("aria-describedby");
      }
    };
  }, [anchor, open, id]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onEscape]);

  useEffect(() => {
    if (open) {
      return;
    }
    const floating = floatingRef.current;
    const running = floating?.getAnimations?.() ?? [];
    if (running.length === 0) {
      onExited();
      return;
    }
    let cancelled = false;
    const waitForExit = async () => {
      await Promise.allSettled(running.map((animation) => animation.finished));
      if (!cancelled) {
        onExited();
      }
    };
    waitForExit();
    return () => {
      cancelled = true;
    };
  }, [open, onExited]);

  return createPortal(
    <div
      ref={floatingRef}
      id={id}
      role="tooltip"
      data-slot="tooltip-content"
      data-state={open ? "delayed-open" : "closed"}
      data-side={side}
      style={{ left: 0, position: "fixed", top: 0 }}
      className={cn(TOOLTIP_CLASS, className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {payload}
      <div
        ref={arrowRef}
        aria-hidden
        data-side={side}
        style={{ position: "absolute" }}
        className={ARROW_CLASS}
      />
    </div>,
    document.body
  );
};

const EMPTY_STATE: TooltipHostState = {
  anchor: null,
  open: false,
  payload: "",
};

const TooltipHost = ({
  handle,
  children,
  ...options
}: { handle: TooltipHandle; children?: ReactNode } & TooltipHostOptions) => {
  const [state, setState] = useState<TooltipHostState>(EMPTY_STATE);
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const api = useMemo<TooltipHostApi>(() => {
    const cancelHide = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
    const closeIfOwner = (anchor: HTMLElement | null) => {
      setState((current) =>
        current.open && (anchor === null || current.anchor === anchor)
          ? { ...current, open: false }
          : current
      );
    };
    return {
      close: () => {
        cancelHide();
        closeIfOwner(null);
      },
      handle,
      hide: (anchor) => {
        if (anchor && stateRef.current.anchor !== anchor) {
          return;
        }
        cancelHide();
        hideTimerRef.current = setTimeout(() => {
          hideTimerRef.current = null;
          closeIfOwner(anchor);
        }, SWITCH_GRACE_MS);
      },
      isOpen: () => stateRef.current.open,
      keepOpen: cancelHide,
      release: (anchor) => {
        if (stateRef.current.anchor !== anchor) {
          return;
        }
        cancelHide();
        setState((current) =>
          current.anchor === anchor ? EMPTY_STATE : current
        );
      },
      show: (anchor, payload) => {
        cancelHide();
        setState({ anchor, open: true, payload });
      },
      update: (anchor, payload) =>
        setState((current) =>
          current.open &&
          current.anchor === anchor &&
          current.payload !== payload
            ? { ...current, payload }
            : current
        ),
    };
  }, [handle]);
  useEffect(
    () => () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    },
    []
  );
  const onExited = useMemo(
    () => () => setState((current) => (current.open ? current : EMPTY_STATE)),
    []
  );
  const onTooltipLeave = useMemo(
    () => () => api.hide(stateRef.current.anchor),
    [api]
  );
  return (
    <TooltipHostContext.Provider value={api}>
      {children}
      {state.anchor && (
        <SharedTooltip
          state={state}
          options={options}
          onExited={onExited}
          onEscape={api.close}
          onPointerEnter={api.keepOpen}
          onPointerLeave={onTooltipLeave}
        />
      )}
    </TooltipHostContext.Provider>
  );
};

const HostTrigger = ({
  host,
  payload,
  render,
  children,
  onBlur,
  onFocus,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  ...props
}: ComponentProps<"button"> &
  RenderProps & { host: TooltipHostApi; payload: string }) => {
  const delay = useContext(TooltipDelayContext);
  const anchorRef = useRef<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerDownRef = useRef(false);
  const releasePressRef = useRef<(() => void) | null>(null);
  const element: ReactElement = render ?? (
    <button type="button" aria-label={payload} />
  );

  useEffect(() => {
    if (anchorRef.current) {
      host.update(anchorRef.current, payload);
    }
  }, [host, payload]);

  const cancelOpen = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
      releasePressRef.current?.();
      if (anchorRef.current) {
        host.release(anchorRef.current);
      }
    },
    [host]
  );

  const show = (anchor: HTMLElement) => {
    anchorRef.current = anchor;
    host.show(anchor, payload);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(event);
    if (event.pointerType === "touch") {
      return;
    }
    const anchor = event.currentTarget;
    cancelOpen();
    if (delay <= 0 || host.isOpen()) {
      show(anchor);
      return;
    }
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      show(anchor);
    }, delay);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    cancelOpen();
    host.hide(event.currentTarget);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    cancelOpen();
    releasePressRef.current?.();
    pointerDownRef.current = true;
    const { pointerId } = event;
    const onPointerEnd = (endEvent: globalThis.PointerEvent) => {
      if (endEvent.pointerId === pointerId) {
        releasePressRef.current?.();
      }
    };
    document.addEventListener("pointerup", onPointerEnd);
    document.addEventListener("pointercancel", onPointerEnd);
    releasePressRef.current = () => {
      pointerDownRef.current = false;
      document.removeEventListener("pointerup", onPointerEnd);
      document.removeEventListener("pointercancel", onPointerEnd);
      releasePressRef.current = null;
    };
    host.close();
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    if (!pointerDownRef.current) {
      show(event.currentTarget);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    host.hide(event.currentTarget);
  };

  return (
    <Slot.Root
      data-slot="tooltip-trigger"
      {...props}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children === undefined
        ? element
        : cloneElement(element, undefined, children)}
    </Slot.Root>
  );
};

const TooltipTrigger = ({
  handle,
  payload,
  render,
  children,
  ...props
}: Omit<ComponentProps<typeof TooltipPrimitive.Trigger>, "asChild"> &
  RenderProps & {
    handle?: TooltipHandle;
    payload?: string;
  }) => {
  const host = useContext(TooltipHostContext);
  if (handle && host?.handle === handle) {
    return (
      <HostTrigger
        host={host}
        payload={payload ?? ""}
        render={render}
        {...props}
      >
        {children}
      </HostTrigger>
    );
  }
  const trigger = (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      {...props}
      {...withRender({ children, render })}
    />
  );
  if (!handle) {
    return trigger;
  }
  return (
    <Tooltip>
      {trigger}
      <TooltipContent>{payload}</TooltipContent>
    </Tooltip>
  );
};

export {
  createTooltipHandle,
  Tooltip,
  TooltipContent,
  TooltipHost,
  TooltipProvider,
  TooltipTrigger,
};
export type { TooltipHandle };
