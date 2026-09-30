import * as React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={`ext-separator ext-separator--${orientation} ${className}`.trim()}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
