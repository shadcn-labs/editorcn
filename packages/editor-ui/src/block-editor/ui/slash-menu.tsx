import * as React from "react";

export type SlashMenuProps = React.HTMLAttributes<HTMLDivElement>;

const SlashMenu = React.forwardRef<HTMLDivElement, SlashMenuProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`block-editor-slash-menu ${className}`.trim()}
      {...props}
    />
  )
);
SlashMenu.displayName = "SlashMenu";

export { SlashMenu };
