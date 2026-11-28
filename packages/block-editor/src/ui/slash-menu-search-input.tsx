import * as React from "react";

import { cn } from "./utils";

export type SlashMenuSearchInputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

const SlashMenuSearchInput = React.forwardRef<
  HTMLInputElement,
  SlashMenuSearchInputProps
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="text"
    className={cn(
      "block-editor-slash-menu-search-input w-full border-none bg-transparent text-[0.8125rem] [font-family:inherit] text-popover-foreground outline-none placeholder:text-muted-foreground",
      className
    )}
    {...props}
  />
));
SlashMenuSearchInput.displayName = "SlashMenuSearchInput";

export { SlashMenuSearchInput };
