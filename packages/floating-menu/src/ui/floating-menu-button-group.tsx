import * as React from "react";

export type FloatingMenuButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const FloatingMenuButtonGroup = React.forwardRef<
  HTMLDivElement,
  FloatingMenuButtonGroupProps
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`fm-group ${className}`.trim()} {...props} />
));
FloatingMenuButtonGroup.displayName = "FloatingMenuButtonGroup";

export { FloatingMenuButtonGroup };
