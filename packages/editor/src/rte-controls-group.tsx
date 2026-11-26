import { useContext } from "react";

import { RichTextEditorContext } from "./rte-context";
import type {
  RichTextEditorControlsGroupProps,
  RichTextEditorVariant,
} from "./types";
import { cn } from "./ui/utils";

const SEPARATOR =
  "[.rte-controls-group+&]:before:w-px [.rte-controls-group+&]:before:shrink-0 [.rte-controls-group+&]:before:bg-border [.rte-controls-group+&]:before:content-[''] [.rte-controls-group+&]:data-line-start:before:invisible";

const BUTTON =
  "[&>button]:border-none [&>button]:bg-transparent [&>button]:transition-[background-color,color] [&>button]:duration-150 [&>button]:ease-[ease-out] [&>button:focus-visible]:outline-2 [&>button:focus-visible]:outline-offset-1 [&>button:focus-visible]:outline-ring/50 [&>button:focus-visible]:outline-solid";

const variantClasses: Record<RichTextEditorVariant, string> = {
  compact: `${SEPARATOR} [.rte-controls-group+&]:before:mx-0.5 [.rte-controls-group+&]:before:h-3.5 ${BUTTON} [&>button]:h-7 [&>button]:min-w-7 [&>button]:rounded-sm [&>button]:text-muted-foreground [&>button:hover]:bg-muted [&>button:hover]:text-foreground [&>button[aria-pressed=true]]:bg-muted [&>button[aria-pressed=true]]:text-foreground [&>button[data-state=on]]:bg-muted [&>button[data-state=on]]:text-foreground`,
  default: `gap-0.5 ${SEPARATOR} [.rte-controls-group+&]:before:mx-1 [.rte-controls-group+&]:before:h-4 ${BUTTON} [&>button]:h-8 [&>button]:min-w-8 [&>button]:rounded-md [&>button]:text-foreground [&>button:disabled]:cursor-not-allowed [&>button:disabled]:opacity-40 [&>button:hover:not(:disabled)]:bg-foreground/5 [&>button:hover:not(:disabled)]:text-foreground [&>button[aria-pressed=true]]:bg-foreground/8 [&>button[aria-pressed=true]]:text-foreground [&>button[data-state=on]]:bg-foreground/8 [&>button[data-state=on]]:text-foreground`,
  subtle: `${SEPARATOR} [.rte-controls-group+&]:before:mx-1 [.rte-controls-group+&]:before:h-4 ${BUTTON} [&>button]:h-8 [&>button]:min-w-8 [&>button]:rounded-md [&>button]:text-muted-foreground [&>button:hover]:bg-muted [&>button:hover]:text-foreground [&>button[aria-pressed=true]]:bg-muted [&>button[aria-pressed=true]]:text-foreground [&>button[data-state=on]]:bg-muted [&>button[data-state=on]]:text-foreground`,
};

export const ControlsGroup = ({
  children,
  className,
}: RichTextEditorControlsGroupProps) => {
  const variant = useContext(RichTextEditorContext)?.variant;

  return (
    <div
      className={cn(
        "rte-controls-group flex items-center empty:hidden",
        variant && variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
