import * as React from "react";

export interface RteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const RteButton = React.forwardRef<HTMLButtonElement, RteButtonProps>(
  ({ className = "", active = false, ...props }, ref) => {
    const cls = [
      "rte-bubble-btn",
      active ? "rte-bubble-btn--active" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type="button" className={cls} {...props} />;
  }
);
RteButton.displayName = "RteButton";

export { RteButton };
