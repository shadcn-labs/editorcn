import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      active = false,
      danger = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const cls = [
      "ext-btn",
      active ? "ext-btn--active" : "",
      danger ? "ext-btn--danger" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={cls}
        data-state={active ? "on" : "off"}
        aria-pressed={active}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
