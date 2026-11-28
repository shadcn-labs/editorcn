import * as React from "react";

import { cn } from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, active = false, ...props }, ref) => {
    const cls = cn(
      "block-editor-bubble-btn flex h-7 cursor-pointer items-center gap-1 rounded-sm border-none bg-transparent px-1.5 text-[0.8125rem] whitespace-nowrap text-popover-foreground [transition:background-color_150ms_ease-out,color_150ms_ease-out,transform_100ms_ease-out] hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:[transform:scale(0.96)] [&>svg]:size-4",
      active && "block-editor-bubble-btn--active bg-accent text-primary",
      className
    );

    return <button ref={ref} type="button" className={cls} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };
