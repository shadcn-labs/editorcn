import * as React from "react";

import { cn } from "./utils";

export type SlashMenuListProps = React.HTMLAttributes<HTMLDivElement>;

const SlashMenuList = React.forwardRef<HTMLDivElement, SlashMenuListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "block-editor-slash-menu-list flex max-h-[280px] flex-col overflow-y-auto p-1 [scrollbar-width:thin]",
        className
      )}
      {...props}
    />
  )
);
SlashMenuList.displayName = "SlashMenuList";

export { SlashMenuList };
