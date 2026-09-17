import * as React from "react";

import { useDropdownPill } from "./dropdown-pill";

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement>;

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className = "", onMouseLeave, ...props }, ref) => {
  const { handlers, pill } = useDropdownPill(onMouseLeave);

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
