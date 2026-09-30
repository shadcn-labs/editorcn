import * as React from "react";

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ className = "", danger = false, type = "button", ...props }, ref) => {
  const cls = [
    "ext-dropdown-item",
    danger ? "ext-dropdown-item--danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      data-dropdown-item
      className={cls}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenuItem };
