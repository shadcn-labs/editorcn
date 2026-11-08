"use client";

import {
  Check,
  Info,
  Lightbulb,
  OctagonAlert,
  SmilePlus,
  StickyNote,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { useToolbar } from "../core/context";
import type { ExtensionLabelKey } from "../core/labels";
import { DropdownMenuContent } from "../ui/dropdown-content";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { DropdownMenuSeparator } from "../ui/dropdown-separator";
import type { CalloutVariant } from "./utils";

export const CALLOUT_ICONS: Record<CalloutVariant, LucideIcon> = {
  danger: OctagonAlert,
  info: Info,
  note: StickyNote,
  tip: Lightbulb,
  warning: TriangleAlert,
};

const VARIANT_LABELS: [CalloutVariant, ExtensionLabelKey][] = [
  ["info", "calloutInfo"],
  ["tip", "calloutTip"],
  ["warning", "calloutWarning"],
  ["danger", "calloutDanger"],
  ["note", "calloutNote"],
];

export const CalloutIcon = ({
  emoji,
  variant,
}: {
  emoji?: string | null;
  variant: CalloutVariant;
}) => {
  if (emoji) {
    return <span className="ext-callout-emoji">{emoji}</span>;
  }
  const Icon = CALLOUT_ICONS[variant];
  return <Icon />;
};

export interface CalloutMenuProps {
  onRemove?: () => void;
  onResetEmoji?: () => void;
  onSelect: (variant: CalloutVariant) => void;
  value?: CalloutVariant | null;
}

export const CalloutMenu = ({
  onRemove,
  onResetEmoji,
  onSelect,
  value,
}: CalloutMenuProps) => {
  const { labels } = useToolbar();
  const listRef = useRef<HTMLDivElement>(null);

  const items = () => [
    ...(listRef.current?.querySelectorAll<HTMLElement>(
      ":scope > [data-dropdown-item]"
    ) ?? []),
  ];

  // Read during the first render so StrictMode's second effect run doesn't
  // pick up the menu item that already has focus.
  const [returnTo] = useState(() =>
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  );
  const restoreFocus = useRef(false);

  useEffect(() => {
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreFocus.current = true;
      }
    };
    // Window capture runs before the dropdown's document listener closes us.
    window.addEventListener("keydown", onEscape, true);
    return () => {
      window.removeEventListener("keydown", onEscape, true);
      const lost =
        !document.activeElement || document.activeElement === document.body;
      if (restoreFocus.current && lost && returnTo?.isConnected) {
        returnTo.focus();
      }
    };
  }, [returnTo]);

  const choose = (action: () => void) => () => {
    restoreFocus.current = true;
    action();
  };

  useEffect(() => {
    const all = items();
    const index = Math.max(
      0,
      VARIANT_LABELS.findIndex(([variant]) => variant === value)
    );
    all[index]?.focus();
  }, [value]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }
    event.preventDefault();
    const all = items();
    const current = all.indexOf(document.activeElement as HTMLElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    all[(current + delta + all.length) % all.length]?.focus();
  };

  return (
    <DropdownMenuContent
      ref={listRef}
      aria-label={labels.callout}
      onKeyDown={onKeyDown}
      style={{ minWidth: "10rem" }}
    >
      {VARIANT_LABELS.map(([variant, label]) => {
        const Icon = CALLOUT_ICONS[variant];
        return (
          <DropdownMenuItem
            key={variant}
            role="menuitemradio"
            aria-checked={variant === value}
            className="ext-callout-menu-item"
            data-variant={variant}
            onClick={choose(() => onSelect(variant))}
          >
            <Icon />
            <span>{labels[label]}</span>
            {variant === value && <Check className="ext-callout-check" />}
          </DropdownMenuItem>
        );
      })}
      {(onResetEmoji || onRemove) && <DropdownMenuSeparator />}
      {onResetEmoji && (
        <DropdownMenuItem onClick={choose(onResetEmoji)}>
          <SmilePlus />
          <span>{labels.resetCalloutIcon}</span>
        </DropdownMenuItem>
      )}
      {onRemove && (
        <DropdownMenuItem danger onClick={onRemove}>
          <Trash2 />
          <span>{labels.removeCallout}</span>
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
};
