import * as React from "react";

import { cn } from "./utils";

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ className, danger = false, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    role="menuitem"
    data-dropdown-item
    className={cn(
      "ext-dropdown-item relative z-1 flex w-full cursor-pointer items-center gap-2 rounded-sm border-none bg-transparent px-2 py-1.5 text-left text-[0.8125rem] text-popover-foreground [transition:background-color_100ms_ease-out,color_100ms_ease-out,scale_100ms_ease-out] hover:text-foreground hover:outline-none focus-visible:text-foreground focus-visible:outline-none active:scale-98 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      danger &&
        "ext-dropdown-item--danger text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenuItem };
