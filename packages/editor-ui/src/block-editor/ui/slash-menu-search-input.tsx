import * as React from "react";

export type SlashMenuSearchInputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

const SlashMenuSearchInput = React.forwardRef<
  HTMLInputElement,
  SlashMenuSearchInputProps
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    type="text"
    className={`block-editor-slash-menu-search-input ${className}`.trim()}
    {...props}
  />
));
SlashMenuSearchInput.displayName = "SlashMenuSearchInput";

export { SlashMenuSearchInput };
