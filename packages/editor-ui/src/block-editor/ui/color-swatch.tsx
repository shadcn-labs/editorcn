import * as React from "react";

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
        className={[
          "block-editor-color-swatch",
          variant === "text"
            ? "block-editor-color-swatch--text"
            : "block-editor-color-swatch--highlight",
          active ? "block-editor-color-swatch--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
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
          <span className="block-editor-color-glyph" aria-hidden="true">
            A
          </span>
        ) : null}
        {active ? (
          <span className="block-editor-color-check" aria-hidden="true">
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
