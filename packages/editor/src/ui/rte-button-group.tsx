import * as React from "react";

export type RteButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const RteButtonGroup = React.forwardRef<HTMLDivElement, RteButtonGroupProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rte-bubble-group ${className}`.trim()}
      {...props}
    />
  )
);
RteButtonGroup.displayName = "RteButtonGroup";

export { RteButtonGroup };
