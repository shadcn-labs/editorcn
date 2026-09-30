import * as React from "react";

import { cn } from "../../lib/cn";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "ghost"
  | "link"
  | "outline"
  | "secondary";

export type ButtonSize =
  | "default"
  | "icon"
  | "icon-lg"
  | "icon-sm"
  | "icon-xs"
  | "lg"
  | "sm"
  | "xs";

export interface ButtonVariantsOptions {
  className?: string;
  size?: ButtonSize | null;
  variant?: ButtonVariant | null;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const buttonVariants = ({
  className,
  size = "default",
  variant = "default",
}: ButtonVariantsOptions = {}): string =>
  cn("rte-btn", `rte-btn--${variant}`, `rte-btn--${size}`, className);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      data-slot="button"
      className={buttonVariants({ className, size, variant })}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
