import * as React from "react";

export type DropdownOverlayProps = React.HTMLAttributes<HTMLDivElement>;

const DropdownOverlay = React.forwardRef<HTMLDivElement, DropdownOverlayProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      role="presentation"
      className={`block-editor-bubble-overlay ${className}`.trim()}
      {...props}
    />
  )
);
DropdownOverlay.displayName = "DropdownOverlay";

export { DropdownOverlay };
