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
        "ext-dropdown-content relative min-w-40 animate-ext-pop-in p-1 rounded-lg bg-popover text-popover-foreground shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] ring-1 ring-border/60 outline-hidden",
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
