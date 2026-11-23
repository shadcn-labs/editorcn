import * as React from "react";

import { cn } from "./utils";

export type RteDropdownIconProps = React.HTMLAttributes<HTMLSpanElement>;

const RteDropdownIcon = React.forwardRef<HTMLSpanElement, RteDropdownIconProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "rte-bubble-dropdown-icon flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-full",
        className
      )}
      {...props}
    />
  )
);
RteDropdownIcon.displayName = "RteDropdownIcon";

export { RteDropdownIcon };
