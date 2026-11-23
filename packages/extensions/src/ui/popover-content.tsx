import * as React from "react";

import { useDropdownPill } from "./dropdown-pill";
import { cn } from "./utils";

export type PopoverContentProps = React.HTMLAttributes<HTMLDivElement>;

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, onMouseLeave, ...props }, ref) => {
    const { handlers, pill } = useDropdownPill(onMouseLeave);

    return (
      <div
        ref={ref}
        className={cn(
          "ext-popover-content relative animate-[ext-pop-in_0.18s_cubic-bezier(0.22,1,0.36,1)_forwards] rounded-lg border border-border bg-popover text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
          className
        )}
        {...handlers}
        {...props}
      >
        {pill}
        {props.children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { PopoverContent };
