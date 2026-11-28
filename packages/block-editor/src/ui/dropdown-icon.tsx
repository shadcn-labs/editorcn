import * as React from "react";

import { cn } from "./utils";

export type DropdownIconProps = React.HTMLAttributes<HTMLSpanElement>;

const DropdownIcon = React.forwardRef<HTMLSpanElement, DropdownIconProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "block-editor-bubble-dropdown-icon flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-full",
        className
      )}
      {...props}
    />
  )
);
DropdownIcon.displayName = "DropdownIcon";

export { DropdownIcon };
