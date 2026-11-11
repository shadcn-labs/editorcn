import {
  ArrowRightIcon,
  BracesIcon,
  CodeXmlIcon,
  HashIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Format, Tool } from "@/lib/tools";
import { FORMAT_LABEL } from "@/lib/tools";
import { cn } from "@/lib/utils";

const FORMAT_ICON: Record<Format, LucideIcon> = {
  html: CodeXmlIcon,
  json: BracesIcon,
  markdown: HashIcon,
};

export const ToolIcon = ({
  className,
  format,
}: {
  className?: string;
  format: Format;
}) => {
  const Icon = FORMAT_ICON[format];
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-foreground",
        className
      )}
    >
      <Icon className="size-4" />
    </span>
  );
};

export const ToolFormatLabel = ({
  className,
  from,
  to,
}: Pick<Tool, "from" | "to"> & { className?: string }) => (
  <span
    className={cn(
      "inline-flex w-fit items-center gap-1 text-xs text-muted-foreground",
      className
    )}
  >
    {FORMAT_LABEL[from]}
    <ArrowRightIcon aria-hidden className="size-3" />
    <span className="sr-only">to</span>
    {FORMAT_LABEL[to]}
  </span>
);
