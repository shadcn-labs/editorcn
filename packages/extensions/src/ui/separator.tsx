import * as React from "react";

import { cn } from "./utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        `ext-separator ext-separator--${orientation} shrink-0 bg-border`,
        orientation === "horizontal"
          ? "my-1 h-px"
          : "mx-1 h-4 w-px self-center",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
