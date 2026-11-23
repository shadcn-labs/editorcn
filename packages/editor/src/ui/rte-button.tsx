import * as React from "react";

import { cn } from "./utils";

export interface RteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const RteButton = React.forwardRef<HTMLButtonElement, RteButtonProps>(
  ({ className, active = false, ...props }, ref) => {
    const cls = cn(
      "rte-bubble-btn flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded-md border-none bg-transparent px-2 text-[0.8125rem] font-medium whitespace-nowrap text-popover-foreground [transition:background-color_150ms_ease-out,color_150ms_ease-out,scale_100ms_ease-out] hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring/50 focus-visible:-outline-offset-2 active:scale-96",
      active && "rte-bubble-btn--active bg-muted text-foreground",
      className
    );

    return <button ref={ref} type="button" className={cls} {...props} />;
  }
);
RteButton.displayName = "RteButton";

export { RteButton };
