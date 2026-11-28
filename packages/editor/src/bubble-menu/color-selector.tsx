import type { Editor } from "@tiptap/react";
import { useState } from "react";

import {
  Button,
  ColorSwatch,
  Dropdown,
  DropdownSeparator,
  Icon,
  Overlay,
} from "../ui";
import { useEditorState, shallowEqual } from "./utils";

type SwatchType = "text" | "highlight";

interface RecentColor {
  type: SwatchType;
  color: string;
  label: string;
}

const RECENT_KEY = "editorcn-editor-recent-colors";
const RECENT_LIMIT = 10;

const readRecentColors = (): RecentColor[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RecentColor[];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
};

const persistRecentColors = (recent: RecentColor[]): void => {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    /* ignored */
  }
};

const TEXT_COLORS = [
  { color: "#0f172a", label: "Foreground" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#f59e0b", label: "Amber" },
  { color: "#22c55e", label: "Green" },
  { color: "#0ea5e9", label: "Sky" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#6366f1", label: "Indigo" },
  { color: "#a855f7", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
] as const;

const HIGHLIGHT_COLORS = [
  { color: "#fef08a", label: "Yellow" },
  { color: "#fed7aa", label: "Orange" },
  { color: "#fecaca", label: "Red" },
  { color: "#fbcfe8", label: "Pink" },
  { color: "#e9d5ff", label: "Purple" },
  { color: "#ddd6fe", label: "Violet" },
  { color: "#bfdbfe", label: "Blue" },
  { color: "#a5f3fc", label: "Cyan" },
  { color: "#99f6e4", label: "Teal" },
  { color: "#bbf7d0", label: "Green" },
] as const;

interface ColorChain {
  run(): boolean;
  setColor(color: string): ColorChain;
  setHighlight(attributes: { color: string }): ColorChain;
  unsetColor(): ColorChain;
  unsetHighlight(): ColorChain;
}

export const ColorSelector = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<RecentColor[]>(() => readRecentColors());

  const { highlightColor, textColor } = useEditorState(
    editor,
    (ed) => ({
      highlightColor: ed.isActive("highlight")
        ? (ed.getAttributes("highlight").color as string | undefined)
        : undefined,
      textColor: ed.isActive("textStyle")
        ? (ed.getAttributes("textStyle").color as string | undefined)
        : undefined,
    }),
    shallowEqual
  );

  const hasColor = editor.extensionManager.extensions.some(
    (ext) => ext.name === "color"
  );
  const hasHighlight = editor.extensionManager.extensions.some(
    (ext) => ext.name === "highlight"
  );

  const remember = (type: SwatchType, color: string, label: string): void => {
    setRecent((prev) => {
      const next = [
        { color, label, type },
        ...prev.filter((item) => !(item.type === type && item.color === color)),
      ].slice(0, RECENT_LIMIT);
      persistRecentColors(next);
      return next;
    });
  };

  const selectText = (color: string, label: string): void => {
    remember("text", color, label);
    if (textColor === color) {
      (editor.chain().focus() as unknown as ColorChain).unsetColor().run();
    } else {
      (editor.chain().focus() as unknown as ColorChain).setColor(color).run();
    }
  };

  const selectHighlight = (color: string, label: string): void => {
    remember("highlight", color, label);
    if (highlightColor === color) {
      (editor.chain().focus() as unknown as ColorChain).unsetHighlight().run();
    } else {
      (editor.chain().focus() as unknown as ColorChain)
        .setHighlight({ color })
        .run();
    }
  };

  if (!hasColor && !hasHighlight) {
    return null;
  }

  return (
    <div style={{ position: "relative" }}>
      <Button
        active={Boolean(textColor || highlightColor)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        title="Text color"
      >
        <Icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rte-editor-icon"
          >
            <path d="M4 20h16" />
            <path d="m6 16 6-12 6 12" />
            <path d="M8 12h8" />
          </svg>
        </Icon>
      </Button>
      {open && (
        <>
          <Overlay
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <Dropdown variant="color">
            {recent.length > 0 ? (
              <div className="rte-bubble-color-section flex flex-col gap-2">
                <span className="rte-bubble-color-label px-0.5 text-[0.75rem] leading-none font-medium text-muted-foreground">
                  Recently Used
                </span>
                <div className="rte-bubble-color-recent flex flex-wrap justify-center gap-1.5">
                  {recent.map((item) => (
                    <ColorSwatch
                      key={`${item.type}-${item.color}`}
                      variant={item.type}
                      color={item.color}
                      label={item.label}
                      active={
                        item.type === "text"
                          ? textColor === item.color
                          : highlightColor === item.color
                      }
                      onSelect={() =>
                        item.type === "text"
                          ? selectText(item.color, item.label)
                          : selectHighlight(item.color, item.label)
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {hasColor ? (
              <>
                {recent.length > 0 && <DropdownSeparator />}
                <div className="rte-bubble-color-section flex flex-col gap-2">
                  <span className="rte-bubble-color-label px-0.5 text-[0.75rem] leading-none font-medium text-muted-foreground">
                    Text Color
                  </span>
                  <div className="rte-bubble-color-grid grid grid-cols-[repeat(5,1.5rem)] justify-center gap-1.5">
                    {TEXT_COLORS.map((item) => (
                      <ColorSwatch
                        key={item.color}
                        variant="text"
                        color={item.color}
                        label={item.label}
                        active={textColor === item.color}
                        onSelect={() => selectText(item.color, item.label)}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}
            {hasHighlight ? (
              <>
                {(recent.length > 0 || hasColor) && <DropdownSeparator />}
                <div className="rte-bubble-color-section flex flex-col gap-2">
                  <span className="rte-bubble-color-label px-0.5 text-[0.75rem] leading-none font-medium text-muted-foreground">
                    Highlight Color
                  </span>
                  <div className="rte-bubble-color-grid grid grid-cols-[repeat(5,1.5rem)] justify-center gap-1.5">
                    {HIGHLIGHT_COLORS.map((item) => (
                      <ColorSwatch
                        key={item.color}
                        variant="highlight"
                        color={item.color}
                        label={item.label}
                        active={highlightColor === item.color}
                        onSelect={() => selectHighlight(item.color, item.label)}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </Dropdown>
        </>
      )}
    </div>
  );
};
