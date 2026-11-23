import * as React from "react";

import { useDropdownPill } from "./dropdown-pill";
import { cn } from "./utils";

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  activeItem?: HTMLElement | null;
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ activeItem, className, onMouseLeave, ...props }, ref) => {
  const { handlers, pill } = useDropdownPill(onMouseLeave, activeItem);

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "ext-dropdown-content relative min-w-40 animate-[ext-pop-in_0.18s_cubic-bezier(0.22,1,0.36,1)_forwards] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
        className
      )}
      {...handlers}
      {...props}
    >
      {pill}
      {props.children}
    </div>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export { DropdownMenuContent };
