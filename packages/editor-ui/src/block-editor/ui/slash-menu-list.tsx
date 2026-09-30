import * as React from "react";

export type SlashMenuListProps = React.HTMLAttributes<HTMLDivElement>;

const SlashMenuList = React.forwardRef<HTMLDivElement, SlashMenuListProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`block-editor-slash-menu-list ${className}`.trim()}
      {...props}
    />
  )
);
SlashMenuList.displayName = "SlashMenuList";

export { SlashMenuList };
