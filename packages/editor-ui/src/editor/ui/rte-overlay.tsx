import * as React from "react";

export type RteOverlayProps = React.HTMLAttributes<HTMLDivElement>;

const RteOverlay = React.forwardRef<HTMLDivElement, RteOverlayProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      role="presentation"
      className={`rte-bubble-overlay ${className}`.trim()}
      {...props}
    />
  )
);
RteOverlay.displayName = "RteOverlay";

export { RteOverlay };
