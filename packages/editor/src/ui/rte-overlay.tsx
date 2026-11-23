import * as React from "react";

import { cn } from "./utils";

export type RteOverlayProps = React.HTMLAttributes<HTMLDivElement>;

const RteOverlay = React.forwardRef<HTMLDivElement, RteOverlayProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="presentation"
      className={cn("rte-bubble-overlay fixed inset-0 z-999", className)}
      {...props}
    />
  )
);
RteOverlay.displayName = "RteOverlay";

export { RteOverlay };
