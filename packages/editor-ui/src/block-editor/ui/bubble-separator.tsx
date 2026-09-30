import * as React from "react";

export type BubbleSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const BubbleSeparator = React.forwardRef<HTMLDivElement, BubbleSeparatorProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`block-editor-bubble-separator ${className}`.trim()}
      {...props}
    />
  )
);
BubbleSeparator.displayName = "BubbleSeparator";

export { BubbleSeparator };
