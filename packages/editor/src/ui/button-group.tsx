import * as React from "react";

import { cn } from "./utils";

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rte-bubble-group flex items-center gap-0.5", className)}
      {...props}
    />
  )
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
