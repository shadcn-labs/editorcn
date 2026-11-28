import * as React from "react";

import { cn } from "./utils";

export type SlashMenuProps = React.HTMLAttributes<HTMLDivElement>;

const SlashMenu = React.forwardRef<HTMLDivElement, SlashMenuProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "block-editor-slash-menu z-100 flex max-w-[300px] min-w-[260px] origin-[var(--origin,0_0)] animate-block-editor-slide-in flex-col overflow-hidden rounded-lg border border-border bg-popover shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
        className
      )}
      {...props}
    />
  )
);
SlashMenu.displayName = "SlashMenu";

export { SlashMenu };
