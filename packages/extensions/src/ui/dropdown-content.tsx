import * as React from "react";

import { useDropdownPill } from "./dropdown-pill";

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  activeItem?: HTMLElement | null;
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ activeItem, className = "", onMouseLeave, ...props }, ref) => {
  const { handlers, pill } = useDropdownPill(onMouseLeave, activeItem);

  return (
    <div
      ref={ref}
      role="menu"
      className={`ext-dropdown-content ${className}`.trim()}
      {...handlers}
      {...props}
    >
      {pill}
      {props.children}
    </div>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export { DropdownMenuContent };
