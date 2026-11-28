import * as React from "react";

import { cn } from "./utils";

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "block-editor-bubble-group flex items-center gap-px",
        className
      )}
      {...props}
    />
  )
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
