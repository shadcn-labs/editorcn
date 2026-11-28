import * as React from "react";

import { cn } from "./utils";

export type IconProps = React.HTMLAttributes<HTMLSpanElement>;

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "rte-bubble-btn-icon flex size-4 shrink-0 items-center justify-center [&_svg]:size-full",
        className
      )}
      {...props}
    />
  )
);
Icon.displayName = "Icon";

export { Icon };
