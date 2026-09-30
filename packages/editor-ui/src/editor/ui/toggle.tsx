"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

export type ToggleVariant = "default" | "outline";

export type ToggleSize = "default" | "lg" | "sm";

export interface ToggleVariantsOptions {
  className?: string;
  size?: ToggleSize | null;
  variant?: ToggleVariant | null;
}

export interface ToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  pressed?: boolean;
  size?: ToggleSize;
  variant?: ToggleVariant;
}

export const toggleVariants = ({
  className,
  size = "default",
  variant = "default",
}: ToggleVariantsOptions = {}): string =>
  cn("rte-toggle", `rte-toggle--${variant}`, `rte-toggle--${size}`, className);

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      defaultPressed = false,
      disabled,
      onClick,
      onPressedChange,
      pressed,
      size = "default",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultPressed);
    const isControlled = pressed !== undefined;
    const isPressed = isControlled ? pressed : uncontrolled;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      const next = !isPressed;
      if (!isControlled) {
        setUncontrolled(next);
      }
      onPressedChange?.(next);
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="toggle"
        data-state={isPressed ? "on" : "off"}
        aria-pressed={isPressed}
        disabled={disabled}
        className={toggleVariants({ className, size, variant })}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
