import * as React from "react";

export type RteIconProps = React.HTMLAttributes<HTMLSpanElement>;

const RteIcon = React.forwardRef<HTMLSpanElement, RteIconProps>(
  ({ className = "", ...props }, ref) => (
    <span
      ref={ref}
      className={`rte-bubble-btn-icon ${className}`.trim()}
      {...props}
    />
  )
);
RteIcon.displayName = "RteIcon";

export { RteIcon };
