import * as React from "react";

export interface BubbleDropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
}

const BubbleDropdownItem = React.forwardRef<
  HTMLButtonElement,
  BubbleDropdownItemProps
>(({ className = "", active = false, danger = false, ...props }, ref) => {
  const cls = [
    "block-editor-bubble-dropdown-item",
    active ? "block-editor-bubble-dropdown-item--active" : "",
    danger ? "block-editor-bubble-dropdown-item--danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type="button"
      data-dropdown-item
      className={cls}
      {...props}
    />
  );
});
BubbleDropdownItem.displayName = "BubbleDropdownItem";

export { BubbleDropdownItem };
