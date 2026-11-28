import * as React from "react";

import { cn } from "./utils";

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, active = false, danger = false, ...props }, ref) => {
    const cls = cn(
      "block-editor-bubble-dropdown-item relative z-1 flex w-full cursor-pointer items-center gap-2 rounded-sm border-none bg-transparent px-2 py-1.5 text-left text-[0.8125rem] text-muted-foreground [transition:background-color_100ms_ease-out,color_100ms_ease-out,transform_100ms_ease-out] hover:text-foreground focus-visible:text-foreground active:[transform:scale(0.98)]",
      active &&
        "block-editor-bubble-dropdown-item--active bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary [&_.block-editor-bubble-dropdown-icon]:text-primary",
      danger &&
        "block-editor-bubble-dropdown-item--danger text-[color:var(--destructive,#ef4444)] hover:bg-[color-mix(in_srgb,var(--destructive,#ef4444)_10%,transparent)] hover:text-[color:var(--destructive,#ef4444)] focus-visible:hover:text-[color:var(--destructive,#ef4444)]",
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
