"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  ChevronsUpDownIcon,
  CodeIcon,
  EyeIcon,
  MonitorIcon,
  MoonIcon,
  RotateCwIcon,
  SmartphoneIcon,
  SunIcon,
  TabletIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import { CopyButton } from "@/components/copy-button";
import { TemplateDemo } from "@/components/template-demo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface BlockViewerItem {
  category: string;
  code: ReactNode;
  docs: string;
  name: string;
  title: string;
  wide?: boolean;
}

const VIEWPORTS = [
  { icon: MonitorIcon, label: "Desktop", value: "desktop", width: "100%" },
  { icon: TabletIcon, label: "Tablet", value: "tablet", width: "768px" },
  { icon: SmartphoneIcon, label: "Mobile", value: "mobile", width: "390px" },
] as const;

type Viewport = (typeof VIEWPORTS)[number]["value"];

const ICON_BUTTON_CLS =
  "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-3.5";

const GROUP_CLS =
  "flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5";

const PICKER_CLS =
  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-foreground transition-colors duration-150 ease-out outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-background motion-reduce:transition-none";

const Picker = ({
  label,
  meta,
  onChange,
  options,
  value,
}: {
  label: string;
  meta?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger className={PICKER_CLS}>
      <span className="truncate">{label}</span>
      {meta ? (
        <span className="text-muted-foreground tabular-nums">{meta}</span>
      ) : null}
      <ChevronsUpDownIcon
        aria-hidden
        className="size-3 shrink-0 text-muted-foreground"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="min-w-48">
      <DropdownMenuRadioGroup onValueChange={onChange} value={value}>
        {options.map((option) => (
          <DropdownMenuRadioItem
            key={option.value}
            className="text-xs"
            value={option.value}
          >
            {option.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={ICON_BUTTON_CLS}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title="Toggle theme"
      type="button"
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </button>
  );
};

export const BlockViewer = ({
  className,
  items,
}: {
  className?: string;
  items: BlockViewerItem[];
}) => {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [reloadKey, setReloadKey] = useState(0);

  const item = items[index];
  const categories = [...new Set(items.map((entry) => entry.category))];
  const inCategory = items.filter((entry) => entry.category === item.category);
  const position = inCategory.findIndex((entry) => entry.name === item.name);
  const registryName = `@editorcn/${item.name}`;
  const width = VIEWPORTS.find((entry) => entry.value === viewport)?.width;

  const select = (name: string) => {
    const next = items.findIndex((entry) => entry.name === name);
    if (next !== -1) {
      setIndex(next);
    }
  };

  const step = (delta: number) =>
    setIndex((current) => (current + delta + items.length) % items.length);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border/60 bg-muted/50 p-1",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
        <div className="flex min-w-0 items-center gap-0.5 text-muted-foreground">
          <Picker
            label={item.category}
            onChange={(category) =>
              select(
                items.find((entry) => entry.category === category)?.name ?? ""
              )
            }
            options={categories.map((category) => ({
              label: category,
              value: category,
            }))}
            value={item.category}
          />
          <span aria-hidden className="text-xs text-muted-foreground/60">
            /
          </span>
          <Picker
            label={item.title}
            meta={`${position + 1}/${inCategory.length}`}
            onChange={select}
            options={inCategory.map((entry) => ({
              label: entry.title,
              value: entry.name,
            }))}
            value={item.name}
          />
          <span aria-hidden className="mx-1 h-4 w-px bg-border" />
          <button
            aria-label="Previous"
            className={ICON_BUTTON_CLS}
            onClick={() => step(-1)}
            title="Previous"
            type="button"
          >
            <ArrowLeftIcon />
          </button>
          <button
            aria-label="Next"
            className={ICON_BUTTON_CLS}
            onClick={() => step(1)}
            title="Next"
            type="button"
          >
            <ArrowRightIcon />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className={cn(GROUP_CLS, "max-md:hidden")}>
            <button
              aria-label="Reload preview"
              className={ICON_BUTTON_CLS}
              onClick={() => setReloadKey((key) => key + 1)}
              title="Reload preview"
              type="button"
            >
              <RotateCwIcon />
            </button>
            <ThemeButton />
            <Link
              aria-label="Open in new tab"
              className={ICON_BUTTON_CLS}
              href={`/preview/${item.name}`}
              prefetch={false}
              target="_blank"
              title="Open in new tab"
            >
              <ArrowUpRightIcon />
            </Link>
          </div>

          <div className={GROUP_CLS}>
            <button
              aria-label="Preview"
              aria-pressed={view === "preview"}
              className={ICON_BUTTON_CLS}
              onClick={() => setView("preview")}
              title="Preview"
              type="button"
            >
              <EyeIcon />
            </button>
            <button
              aria-label="Code"
              aria-pressed={view === "code"}
              className={ICON_BUTTON_CLS}
              onClick={() => setView("code")}
              title="Code"
              type="button"
            >
              <CodeIcon />
            </button>
          </div>

          <div className={cn(GROUP_CLS, "max-lg:hidden")}>
            {VIEWPORTS.map((entry) => (
              <button
                key={entry.value}
                aria-label={entry.label}
                aria-pressed={viewport === entry.value}
                className={ICON_BUTTON_CLS}
                disabled={view === "code"}
                onClick={() => setViewport(entry.value)}
                title={entry.label}
                type="button"
              >
                <entry.icon />
              </button>
            ))}
          </div>

          <div className={cn(GROUP_CLS, "max-sm:hidden")}>
            <span className="px-1.5 font-mono text-xs text-muted-foreground">
              {registryName}
            </span>
            <CopyButton
              className="static size-7 rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
              value={`npx shadcn@latest add ${registryName}`}
            />
          </div>

          <Link
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium text-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
            href={item.docs}
          >
            <BookOpenIcon aria-hidden className="size-3.5" />
            Docs
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
        {view === "preview" ? (
          <div className="px-4 py-6 sm:px-8 sm:py-12">
            <div
              className="mx-auto transition-[max-width] duration-200 ease-out motion-reduce:transition-none"
              style={{ maxWidth: width }}
            >
              <div
                key={`${item.name}-${reloadKey}`}
                className={cn(
                  "mx-auto",
                  !item.wide &&
                    "max-w-3xl max-sm:[&_.block-editor-content]:max-h-[32rem] max-sm:[&_.block-editor-content]:overflow-y-auto max-sm:[&_.rte-content]:max-h-[28rem] max-sm:[&_.rte-content]:overflow-y-auto"
                )}
              >
                <TemplateDemo name={item.name} />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 sm:p-4">{item.code}</div>
        )}
      </div>
    </div>
  );
};
