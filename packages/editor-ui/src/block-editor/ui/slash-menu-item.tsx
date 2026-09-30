import * as React from "react";

export interface SlashMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

const SlashMenuItem = React.forwardRef<HTMLButtonElement, SlashMenuItemProps>(
  ({ className = "", selected = false, ...props }, ref) => {
    const cls = [
      "block-editor-slash-menu-item",
      selected ? "block-editor-slash-menu-item--selected" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type="button" className={cls} {...props} />;
  }
);
SlashMenuItem.displayName = "SlashMenuItem";

export { SlashMenuItem };
