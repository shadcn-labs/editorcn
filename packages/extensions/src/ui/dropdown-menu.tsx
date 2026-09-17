import * as React from "react";
import { useCallback } from "react";

import { useFloating } from "./use-floating";

export type DropdownMenuSide = "bottom" | "right";

export interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  side?: DropdownMenuSide;
  trigger: React.ReactElement;
}

const DropdownMenu = ({
  children,
  onOpenChange,
  open = false,
  side = "bottom",
  trigger,
}: DropdownMenuProps) => {
  const { content, triggerRef } = useFloating({
    align: side === "right" ? "center" : "start",
    onOpenChange,
    open,
    side,
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
      "aria-haspopup": "menu",
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

DropdownMenu.displayName = "DropdownMenu";

export { DropdownMenu };
