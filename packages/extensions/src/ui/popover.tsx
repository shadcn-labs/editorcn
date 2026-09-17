import * as React from "react";
import { useCallback } from "react";

import { useFloating } from "./use-floating";
import type { FloatingAlign, FloatingSide } from "./use-floating";

export type PopoverAlign = FloatingAlign;
export type PopoverSide = FloatingSide;

export interface PopoverProps {
  align?: PopoverAlign;
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  side?: PopoverSide;
  sideOffset?: number;
  trigger: React.ReactElement;
}

const Popover = ({
  align = "center",
  children,
  onOpenChange,
  open = false,
  side = "bottom",
  sideOffset = 4,
  trigger,
}: PopoverProps) => {
  const { content, triggerRef } = useFloating({
    align,
    onOpenChange,
    open,
    side,
    sideOffset,
  });

  const toggle = useCallback(() => {
    onOpenChange?.(!open);
  }, [onOpenChange, open]);

  const triggerWithHandlers = React.cloneElement(
    trigger as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
    >,
    {
      "aria-expanded": open,
      "aria-haspopup": "dialog",
      onClick: toggle,
      ref: triggerRef,
    }
  );

  return (
    <>
      {triggerWithHandlers}
      {content(children)}
    </>
  );
};

Popover.displayName = "Popover";

export { Popover };
