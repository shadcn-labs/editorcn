"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CodeIcon,
  EyeIcon,
  MoonIcon,
  RotateCwIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";

import { CopyButton } from "@/components/copy-button";
import { TemplateDemo } from "@/components/template-demo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BlockViewerItem {
  category: string;
  code: ReactNode;
  docs: string;
  name: string;
  title: string;
  wide?: boolean;
}

const ICON_BUTTON_CLS =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [&_svg]:size-3.5";

const GROUP_CLS =
  "flex shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5";

const PICKER_CLS =
  "inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted sm:hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-muted sm:data-[state=open]:bg-background motion-reduce:transition-none";

const Action = ({
  children,
  disabled,
  href,
  label,
  onClick,
  pressed,
}: {
  children: ReactNode;
  disabled?: boolean;
  href?: string;
  label: string;
  onClick?: () => void;
  pressed?: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      {href ? (
        <Link
          aria-label={label}
          className={ICON_BUTTON_CLS}
          href={href}
          prefetch={false}
          target="_blank"
        >
          {children}
        </Link>
      ) : (
        <button
          aria-label={label}
          aria-pressed={pressed}
          className={ICON_BUTTON_CLS}
          disabled={disabled}
          onClick={onClick}
          type="button"
        >
          {children}
        </button>
      )}
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

const ThemeAction = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Action
      label={isDark ? "Light theme" : "Dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Action>
  );
};

const Picker = ({
  className,
  groups,
  label,
  meta,
  onChange,
  value,
}: {
  className?: string;
  groups: { label?: string; options: { label: string; value: string }[] }[];
  label: string;
  meta?: string;
  onChange: (value: string) => void;
  value: string;
}) => (
  <DropdownMenu sounds>
    <DropdownMenuTrigger className={cn(PICKER_CLS, className)}>
      <span className="truncate">{label}</span>
      {meta ? (
        <span className="shrink-0 text-muted-foreground tabular-nums max-sm:hidden">
          {meta}
        </span>
      ) : null}
      <ChevronsUpDownIcon
        aria-hidden
        className="ml-auto size-3 shrink-0 text-muted-foreground"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      className="min-w-48"
      collisionPadding={8}
      onCloseAutoFocus={(event) => event.preventDefault()}
    >
      {groups.map((group, index) => (
        <Fragment key={group.label ?? index}>
          {index > 0 ? <DropdownMenuSeparator /> : null}
          {group.label ? (
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
          ) : null}
          {group.options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(option.value)}
              sound="click"
            >
              {option.label}
              {option.value === value ? (
                <CheckIcon aria-hidden className="ml-auto" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </Fragment>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const BlockViewer = ({
  className,
  items,
}: {
  className?: string;
  items: BlockViewerItem[];
}) => {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [reloadKey, setReloadKey] = useState(0);

  const item = items[index];
  const categories = [...new Set(items.map((entry) => entry.category))];
  const inCategory = items.filter((entry) => entry.category === item.category);
  const position = inCategory.findIndex((entry) => entry.name === item.name);
  const registryName = `@editorcn/${item.name}`;
  const itemGroups = categories.map((category) => ({
    label: category,
    options: items
      .filter((entry) => entry.category === category)
      .map((entry) => ({ label: entry.title, value: entry.name })),
  }));

  const select = (name: string) => {
    const next = items.findIndex((entry) => entry.name === name);
    if (next !== -1) {
      setIndex(next);
    }
  };

  const step = (delta: number) =>
    setIndex((current) => (current + delta + items.length) % items.length);

  const arrows = (
    <>
      <Action label="Previous" onClick={() => step(-1)}>
        <ArrowLeftIcon />
      </Action>
      <Action label="Next" onClick={() => step(1)}>
        <ArrowRightIcon />
      </Action>
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col sm:rounded-xl sm:border sm:border-border/60 sm:bg-muted/50 sm:p-1",
        className
      )}
    >
      <div className="flex items-center gap-2 pb-3 sm:px-1 sm:pb-1">
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <Picker
            className="w-28 max-sm:hidden"
            groups={[
              {
                options: categories.map((category) => ({
                  label: category,
                  value: category,
                })),
              },
            ]}
            label={item.category}
            onChange={(category) =>
              select(
                items.find((entry) => entry.category === category)?.name ?? ""
              )
            }
            value={item.category}
          />
          <span
            aria-hidden
            className="text-xs text-muted-foreground/60 max-sm:hidden"
          >
            /
          </span>
          <Picker
            className="max-sm:-ml-2 sm:w-56"
            groups={itemGroups}
            label={item.title}
            meta={`${position + 1}/${inCategory.length}`}
            onChange={select}
            value={item.name}
          />
          <span aria-hidden className="mx-1 h-4 w-px bg-border max-sm:hidden" />
          <div className="flex items-center max-sm:hidden">{arrows}</div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className={cn(GROUP_CLS, "max-md:hidden")}>
            <Action
              label="Reload preview"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RotateCwIcon />
            </Action>
            <ThemeAction />
            <Action href={`/preview/${item.name}`} label="Open in new tab">
              <ArrowUpRightIcon />
            </Action>
          </div>

          <div className={GROUP_CLS}>
            <Action
              label="Preview"
              onClick={() => setView("preview")}
              pressed={view === "preview"}
            >
              <EyeIcon />
            </Action>
            <Action
              label="Code"
              onClick={() => setView("code")}
              pressed={view === "code"}
            >
              <CodeIcon />
            </Action>
          </div>

          <div className={cn(GROUP_CLS, "max-md:hidden")}>
            <span className="max-w-48 truncate px-1.5 font-mono text-xs text-muted-foreground">
              {registryName}
            </span>
            <CopyButton
              className="static size-7 rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
              value={`npx shadcn@latest add ${registryName}`}
            />
          </div>

          <Link
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium text-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:hidden motion-reduce:transition-none"
            href={item.docs}
          >
            <BookOpenIcon aria-hidden className="size-3.5" />
            Docs
          </Link>

          <div className="flex items-center sm:hidden">{arrows}</div>
        </div>
      </div>

      <div className="bg-background sm:min-h-[36rem] sm:overflow-hidden sm:rounded-lg sm:border sm:border-border/60">
        <div
          key={`${item.name}-${view}-${reloadKey}`}
          className="animate-in duration-200 fade-in-0 motion-reduce:animate-none"
        >
          {view === "preview" ? (
            <div className="sm:px-8 sm:py-12">
              <div
                className={cn(
                  "mx-auto",
                  !item.wide &&
                    "max-w-3xl [&_.block-editor-content]:max-h-[32rem] [&_.block-editor-content]:overflow-y-auto [&_.rte-content]:max-h-[28rem] [&_.rte-content]:overflow-y-auto sm:[&_.block-editor-content]:max-h-[36rem] sm:[&_.rte-content]:max-h-[32rem]"
                )}
              >
                <TemplateDemo name={item.name} />
              </div>
            </div>
          ) : (
            <div className="sm:p-4">{item.code}</div>
          )}
        </div>
      </div>
    </div>
  );
};
