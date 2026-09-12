import * as React from "react";

export interface FloatingMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const FloatingMenuButton = React.forwardRef<
  HTMLButtonElement,
  FloatingMenuButtonProps
>(({ className = "", active = false, ...props }, ref) => {
  const cls = ["fm-item", active ? "fm-item--active" : "", className]
    .filter(Boolean)
    .join(" ");

  return <button ref={ref} type="button" className={cls} {...props} />;
});
FloatingMenuButton.displayName = "FloatingMenuButton";

export { FloatingMenuButton };
