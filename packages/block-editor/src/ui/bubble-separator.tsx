import * as React from "react";

import { cn } from "../lib/utils";

export type BubbleSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const BubbleSeparator = React.forwardRef<HTMLDivElement, BubbleSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "block-editor-bubble-separator mx-0.5 h-5 w-px shrink-0 bg-border",
        className
      )}
      {...props}
    />
  )
);
BubbleSeparator.displayName = "BubbleSeparator";

export { BubbleSeparator };
