import * as React from "react";

import { cn } from "../lib/utils";

export type SlashMenuSearchProps = React.HTMLAttributes<HTMLDivElement>;

const SlashMenuSearch = React.forwardRef<HTMLDivElement, SlashMenuSearchProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "block-editor-slash-menu-search flex items-center gap-2 border-b border-border bg-popover px-3 py-2",
        className
      )}
      {...props}
    />
  )
);
SlashMenuSearch.displayName = "SlashMenuSearch";

export { SlashMenuSearch };
