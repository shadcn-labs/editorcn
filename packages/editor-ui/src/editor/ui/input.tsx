import * as React from "react";

import { cn } from "../../lib/cn";

const Input = ({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) => (
  <input
    type={type}
    data-slot="input"
    className={cn("rte-input", className)}
    {...props}
  />
);

export { Input };
