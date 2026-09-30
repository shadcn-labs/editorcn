import * as React from "react";

import { useDropdownPill } from "./dropdown-pill";

export type PopoverContentProps = React.HTMLAttributes<HTMLDivElement>;

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className = "", onMouseLeave, ...props }, ref) => {
    const { handlers, pill } = useDropdownPill(onMouseLeave);

    return (
      <div
        ref={ref}
        className={`ext-popover-content ${className}`.trim()}
        {...handlers}
        {...props}
      >
        {pill}
        {props.children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { PopoverContent };
