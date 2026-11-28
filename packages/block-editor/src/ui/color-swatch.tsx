import * as React from "react";

import { cn } from "./utils";

export interface ColorSwatchProps {
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

const ColorSwatch = React.forwardRef<HTMLButtonElement, ColorSwatchProps>(
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
          "block-editor-color-swatch inline-flex size-6 cursor-pointer items-center justify-center rounded-[999px] border border-transparent p-0 [transition:transform_120ms_cubic-bezier(0.34,1.56,0.64,1),all_100ms_ease-out] hover:[transform:scale(1.1)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid active:[transform:scale(0.96)]",
          variant === "text"
            ? "block-editor-color-swatch--text border-(--swatch-color) bg-transparent text-(--swatch-color)"
            : "block-editor-color-swatch--highlight border-transparent bg-(--swatch-color) text-(--swatch-check)",
          active && "block-editor-color-swatch--active",
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
            className="block-editor-color-glyph text-[0.625rem] leading-none font-bold"
            aria-hidden="true"
          >
            A
          </span>
        ) : null}
        {active ? (
          <span
            className="block-editor-color-check flex size-3 items-center justify-center text-(--swatch-check) [&_svg]:size-full"
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
ColorSwatch.displayName = "ColorSwatch";

export { ColorSwatch };
