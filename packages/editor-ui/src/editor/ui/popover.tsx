"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { useFloating } from "../../lib/use-floating";
import type { FloatingAlign, FloatingSide } from "../../lib/use-floating";
import { usePresence } from "../../lib/use-presence";
import { composeRefs, renderPrimitive } from "./render";
import type { RenderElement } from "./render";

const EXIT_DURATION = 100;

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

const usePopoverContext = (component: string): PopoverContextValue => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used inside a Popover`);
  }
  return context;
};

export interface PopoverProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

const Popover = ({
  children,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen,
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen]
  );

  return (
    <PopoverContext.Provider value={value}>
      <div data-slot="popover" data-state={open ? "open" : "closed"}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};
Popover.displayName = "Popover";

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderElement;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ onClick, render, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopoverContext("PopoverTrigger");

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setOpen(!open);
    };

    return renderPrimitive({
      fallbackType: "button",
      ownProps: {
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        "data-slot": "popover-trigger",
        "data-state": open ? "open" : "closed",
        onClick: handleClick,
        type: "button",
        ...props,
      },
      ownRef: composeRefs(triggerRef, ref) as React.Ref<HTMLButtonElement>,
      render,
    });
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: FloatingAlign;
  alignOffset?: number;
  render?: RenderElement;
  side?: FloatingSide;
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      align = "center",
      alignOffset = 0,
      className,
      render,
      side = "bottom",
      sideOffset = 4,
      ...props
    },
    ref
  ) => {
    const { open, setOpen, triggerRef } = usePopoverContext("PopoverContent");
    const mounted = usePresence(open, EXIT_DURATION);

    const { content } = useFloating({
      align,
      onOpenChange: setOpen,
      open,
      side,
      sideOffset,
      triggerRef,
    });

    if (!mounted) {
      return null;
    }

    return content(
      renderPrimitive({
        fallbackType: "div",
        ownProps: {
          className: cn("rte-popover-content", className),
          "data-align-offset": alignOffset || undefined,
          "data-side": side,
          "data-slot": "popover-content",
          "data-state": open ? "open" : "closed",
          ...props,
        },
        ownRef: ref as React.Ref<HTMLElement>,
        precedence: "own",
        render,
      })
    );
  }
);
PopoverContent.displayName = "PopoverContent";

const PopoverHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="popover-header"
    className={cn("rte-popover-header", className)}
    {...props}
  />
);

const PopoverTitle = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="popover-title"
    className={cn("rte-popover-title", className)}
    {...props}
  />
);

const PopoverDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="popover-description"
    className={cn("rte-popover-description", className)}
    {...props}
  />
);

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
