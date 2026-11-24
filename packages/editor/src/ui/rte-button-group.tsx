import * as React from "react";

import { cn } from "./utils";

export type RteButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const RteButtonGroup = React.forwardRef<HTMLDivElement, RteButtonGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rte-bubble-group flex items-center gap-0.5", className)}
      {...props}
    />
  )
);
RteButtonGroup.displayName = "RteButtonGroup";

export { RteButtonGroup };
