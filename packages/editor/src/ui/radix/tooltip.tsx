"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import { createContext, useContext } from "react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../utils";
import { withRender } from "./render";
import type { RenderProps } from "./render";

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
      className={cn(
        "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-none bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-none data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-none bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
);

type TooltipContentOptions = Omit<
  ComponentProps<typeof TooltipContent>,
  "children"
>;

interface TooltipHandle {
  readonly kind: "tooltip-handle";
}

const createTooltipHandle = (): TooltipHandle => ({ kind: "tooltip-handle" });

const TooltipHostContext = createContext<TooltipContentOptions>({});

const TooltipHost = ({
  handle: _handle,
  children,
  ...props
}: { handle: TooltipHandle; children?: ReactNode } & TooltipContentOptions) => (
  <TooltipHostContext.Provider value={props}>
    {children}
  </TooltipHostContext.Provider>
);

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
  const hostOptions = useContext(TooltipHostContext);
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
      <TooltipContent {...hostOptions}>{payload}</TooltipContent>
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
