import * as React from "react";

export type BubbleDropdownDividerProps = React.HTMLAttributes<HTMLDivElement>;

const BubbleDropdownDivider = React.forwardRef<
  HTMLDivElement,
  BubbleDropdownDividerProps
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`block-editor-bubble-dropdown-divider ${className}`.trim()}
    {...props}
  />
));
BubbleDropdownDivider.displayName = "BubbleDropdownDivider";

export { BubbleDropdownDivider };
