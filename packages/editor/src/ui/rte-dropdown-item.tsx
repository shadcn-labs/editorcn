import * as React from "react";

export interface RteDropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const RteDropdownItem = React.forwardRef<
  HTMLButtonElement,
  RteDropdownItemProps
>(({ className = "", active = false, ...props }, ref) => {
  const cls = [
    "rte-bubble-dropdown-item",
    active ? "rte-bubble-dropdown-item--active" : "",
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
RteDropdownItem.displayName = "RteDropdownItem";

export { RteDropdownItem };
