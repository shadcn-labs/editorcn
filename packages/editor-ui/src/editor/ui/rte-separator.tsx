import * as React from "react";

export type RteSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const RteSeparator = React.forwardRef<HTMLDivElement, RteSeparatorProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rte-bubble-separator ${className}`.trim()}
      {...props}
    />
  )
);
RteSeparator.displayName = "RteSeparator";

export { RteSeparator };
