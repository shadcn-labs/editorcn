import * as React from "react";

import { cn } from "../lib/utils";

export interface SlashMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

const SlashMenuItem = React.forwardRef<HTMLButtonElement, SlashMenuItemProps>(
  ({ className, selected = false, ...props }, ref) => {
    const cls = cn(
      "block-editor-slash-menu-item flex w-full cursor-pointer items-center gap-3 rounded-sm border-none bg-transparent p-2 text-left text-[0.875rem] text-popover-foreground [transition:background-color_100ms_ease-out,color_100ms_ease-out,transform_100ms_ease-out] hover:bg-accent hover:text-accent-foreground active:[transform:scale(0.98)] hover:[&_.block-editor-slash-menu-item-icon]:text-foreground",
      selected &&
        "block-editor-slash-menu-item--selected bg-accent text-accent-foreground [&_.block-editor-slash-menu-item-icon]:text-foreground",
      className
    );

    return <button ref={ref} type="button" className={cls} {...props} />;
  }
);
SlashMenuItem.displayName = "SlashMenuItem";

export { SlashMenuItem };
