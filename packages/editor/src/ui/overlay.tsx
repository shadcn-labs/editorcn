import * as React from "react";

import { cn } from "./utils";

export type OverlayProps = React.HTMLAttributes<HTMLDivElement>;

const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="presentation"
      className={cn("rte-bubble-overlay fixed inset-0 z-999", className)}
      {...props}
    />
  )
);
Overlay.displayName = "Overlay";

export { Overlay };
