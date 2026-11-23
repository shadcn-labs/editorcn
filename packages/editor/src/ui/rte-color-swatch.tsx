import * as React from "react";

import { cn } from "./utils";

export interface RteColorSwatchProps {
  color: string;
  label: string;
  variant: "text" | "highlight";
  active?: boolean;
  onSelect: (color: string) => void;
}

const getCheckColor = (hex: string): string => {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? "#18181b" : "#ffffff";
};

const RteColorSwatch = React.forwardRef<HTMLButtonElement, RteColorSwatchProps>(
  ({ color, label, variant, active = false, onSelect }, ref) => {
    const checkColor = getCheckColor(color);

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        aria-label={label}
        title={label}
        className={cn(
          "rte-bubble-color-swatch inline-flex size-6 cursor-pointer items-center justify-center rounded-sm border border-transparent p-0 [transition:transform_150ms_ease-out,opacity_150ms_ease-out] hover:opacity-85 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring/50 focus-visible:outline-offset-1 active:[transform:scale(0.96)]",
          variant === "text"
            ? "rte-bubble-color-swatch--text border-(--swatch-color) bg-transparent text-(--swatch-color)"
            : "rte-bubble-color-swatch--highlight border-transparent bg-(--swatch-color) text-(--swatch-check)",
          active && "rte-bubble-color-swatch--active",
          active &&
            variant === "text" &&
            "border-(--swatch-color) bg-(--swatch-color) text-(--swatch-check)",
          active &&
            variant === "highlight" &&
            "shadow-[0_0_0_2px_color-mix(in_srgb,var(--swatch-color)_55%,var(--popover-foreground))]"
        )}
        style={
          {
            "--swatch-check": checkColor,
            "--swatch-color": color,
          } as React.CSSProperties
        }
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSelect(color)}
      >
        {variant === "text" && !active ? (
          <span
            className="rte-bubble-color-glyph text-[0.6875rem] leading-none font-semibold"
            aria-hidden="true"
          >
            A
          </span>
        ) : null}
        {active ? (
          <span
            className="rte-bubble-color-check flex size-3 items-center justify-center text-(--swatch-check) [&_svg]:size-full"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        ) : null}
      </button>
    );
  }
);
RteColorSwatch.displayName = "RteColorSwatch";

export { RteColorSwatch };
