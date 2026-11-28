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
          "ext-popover-content relative animate-ext-pop-in p-2.5 rounded-lg bg-popover text-popover-foreground shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] ring-1 ring-border/60 outline-hidden",
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
