import * as React from "react";

export type BubbleDropdownIconProps = React.HTMLAttributes<HTMLSpanElement>;

const BubbleDropdownIcon = React.forwardRef<
  HTMLSpanElement,
  BubbleDropdownIconProps
>(({ className = "", ...props }, ref) => (
  <span
    ref={ref}
    className={`block-editor-bubble-dropdown-icon ${className}`.trim()}
    {...props}
  />
));
BubbleDropdownIcon.displayName = "BubbleDropdownIcon";

export { BubbleDropdownIcon };
