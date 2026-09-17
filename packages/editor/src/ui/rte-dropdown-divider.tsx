import * as React from "react";

export type RteDropdownDividerProps = React.HTMLAttributes<HTMLDivElement>;

const RteDropdownDivider = React.forwardRef<
  HTMLDivElement,
  RteDropdownDividerProps
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`rte-bubble-dropdown-divider ${className}`.trim()}
    {...props}
  />
));
RteDropdownDivider.displayName = "RteDropdownDivider";

export { RteDropdownDivider };
