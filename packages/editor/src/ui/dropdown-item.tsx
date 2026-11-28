import * as React from "react";

import { cn } from "./utils";

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, active = false, ...props }, ref) => {
    const cls = cn(
      "rte-bubble-dropdown-item relative z-1 flex h-8 w-full cursor-pointer items-center justify-start gap-2 rounded-sm border-none bg-transparent px-2 text-left text-[0.8125rem] text-muted-foreground outline-none [transition:background-color_150ms_ease-out,color_150ms_ease-out] hover:text-foreground focus-visible:text-foreground hover:[&_.rte-bubble-dropdown-icon]:text-foreground",
      active &&
        "rte-bubble-dropdown-item--active bg-muted font-medium text-foreground [&_.rte-bubble-dropdown-icon]:text-foreground",
      className
    );

    return (
      <button
        ref={ref}
        type="button"
        data-dropdown-item
        className={cls}
        {...props}
      />
    );
  }
);
DropdownItem.displayName = "DropdownItem";

export { DropdownItem };
