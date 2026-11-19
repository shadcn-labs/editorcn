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
  "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-none bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-none data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95";

const ARROW_CLASS =
  "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-none bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5";

const TooltipProvider = ({
  delay = 0,
  ...props
}: Omit<ComponentProps<typeof TooltipPrimitive.Provider>, "delayDuration"> & {
  delay?: number;
}) => (
  <TooltipPrimitive.Provider
    data-slot="tooltip-provider"
    delayDuration={delay}
    {...props}
  />
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
}: ComponentProps<typeof TooltipPrimitive.Content>) => (
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
  show: (anchor: HTMLElement, payload: string) => void;
  hide: () => void;
  close: () => void;
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
}: {
  state: TooltipHostState;
  options: TooltipHostOptions;
  onExited: () => void;
  onEscape: () => void;
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
      if (previous) {
        anchor.setAttribute("aria-describedby", previous);
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

const TooltipHost = ({
  handle: _handle,
  children,
  ...options
}: { handle: TooltipHandle; children?: ReactNode } & TooltipHostOptions) => {
  const [state, setState] = useState<TooltipHostState>({
    anchor: null,
    open: false,
    payload: "",
  });
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const api = useMemo<TooltipHostApi>(() => {
    const cancelHide = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
    const close = () => {
      cancelHide();
      setState((current) =>
        current.open ? { ...current, open: false } : current
      );
    };
    return {
      close,
      hide: () => {
        cancelHide();
        hideTimerRef.current = setTimeout(close, SWITCH_GRACE_MS);
      },
      show: (anchor, payload) => {
        cancelHide();
        setState({ anchor, open: true, payload });
      },
    };
  }, []);
  useEffect(
    () => () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    },
    []
  );
  const onExited = useMemo(
    () => () =>
      setState((current) =>
        current.open ? current : { anchor: null, open: false, payload: "" }
      ),
    []
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
  const pointerDownRef = useRef(false);
  const element: ReactElement = render ?? (
    <button type="button" aria-label={payload} />
  );

  const handlePointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(event);
    if (event.pointerType !== "touch") {
      host.show(event.currentTarget, payload);
    }
  };

  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    host.hide();
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    pointerDownRef.current = true;
    document.addEventListener(
      "pointerup",
      () => {
        pointerDownRef.current = false;
      },
      { once: true }
    );
    host.close();
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    if (!pointerDownRef.current) {
      host.show(event.currentTarget, payload);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    host.hide();
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
  if (handle && host) {
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
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      {...props}
      {...withRender({ children, render })}
    />
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
