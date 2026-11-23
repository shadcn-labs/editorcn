import * as React from "react";

import { cn } from "./utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "ext-input h-8 w-full rounded-md border border-border bg-background px-2.5 text-[0.8125rem] text-foreground outline-none [transition:border-color_150ms_ease-out,box-shadow_150ms_ease-out] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--ring)_30%,transparent)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
