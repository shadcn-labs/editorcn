import * as React from "react";

export type BubbleButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const BubbleButtonGroup = React.forwardRef<
  HTMLDivElement,
  BubbleButtonGroupProps
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`block-editor-bubble-group ${className}`.trim()}
    {...props}
  />
));
BubbleButtonGroup.displayName = "BubbleButtonGroup";

export { BubbleButtonGroup };
