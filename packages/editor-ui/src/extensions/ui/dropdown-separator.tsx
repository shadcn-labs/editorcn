import * as React from "react";

export type DropdownMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`ext-dropdown-separator ${className}`.trim()}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export { DropdownMenuSeparator };
