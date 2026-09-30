import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`ext-input ${className}`.trim()} {...props} />
  )
);
Input.displayName = "Input";

export { Input };
