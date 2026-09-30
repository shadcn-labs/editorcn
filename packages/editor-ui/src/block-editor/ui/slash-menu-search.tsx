import * as React from "react";

export type SlashMenuSearchProps = React.HTMLAttributes<HTMLDivElement>;

const SlashMenuSearch = React.forwardRef<HTMLDivElement, SlashMenuSearchProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`block-editor-slash-menu-search ${className}`.trim()}
      {...props}
    />
  )
);
SlashMenuSearch.displayName = "SlashMenuSearch";

export { SlashMenuSearch };
