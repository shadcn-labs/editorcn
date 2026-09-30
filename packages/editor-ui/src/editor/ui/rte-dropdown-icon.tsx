import * as React from "react";

export type RteDropdownIconProps = React.HTMLAttributes<HTMLSpanElement>;

const RteDropdownIcon = React.forwardRef<HTMLSpanElement, RteDropdownIconProps>(
  ({ className = "", ...props }, ref) => (
    <span
      ref={ref}
      className={`rte-bubble-dropdown-icon ${className}`.trim()}
      {...props}
    />
  )
);
RteDropdownIcon.displayName = "RteDropdownIcon";

export { RteDropdownIcon };
