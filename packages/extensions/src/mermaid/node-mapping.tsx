import { Spinner } from "@editorcn/ui/components/spinner";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, GhostIcon } from "lucide-react";
import type { RenderResult } from "mermaid";
import { useTheme } from "next-themes";
import { useRef } from "react";

import type { MermaidAttributes } from "./types";

// Mermaid 11 queues `render` calls, but `initialize` mutates global config
// immediately. Serialise each init+render pair so a theme switch cannot bleed
// into a queued render of the other theme.
let renderQueue: Promise<unknown> = Promise.resolve();

/* eslint-disable promise/prefer-await-to-then, promise/avoid-new */
const serialize = <T,>(fn: () => Promise<T>): Promise<T> => {
  const next = renderQueue.then(() => fn());
  renderQueue = next.then(
    () => null,
    () => null
  );
  return next;
};

export const NodeMapping = (attrs: MermaidAttributes) => {
  const { resolvedTheme } = useTheme();

  const trimmedValue = attrs.value?.trim() ?? "";

  const lastGoodRef = useRef<RenderResult | null>(null);

  const { data, isPending, isFetching, isError, error } = useQuery({
    enabled: Boolean(trimmedValue),
    gcTime: 1000 * 60 * 60 * 24,
    networkMode: "always",
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<RenderResult> => {
      if (!trimmedValue) {
        throw new Error("Diagram code not provided");
      }

      const { default: mermaid } = await import("mermaid");

      return serialize(async () => {
        mermaid.initialize({
          fontFamily: "Geist, sans-serif",
          fontSize: 14,
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: resolvedTheme === "dark" ? "dark" : "neutral",
        });

        const uniqueId = `mermaid-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        const result = await mermaid.render(uniqueId, trimmedValue);
        lastGoodRef.current = result;
        return result;
      });
    },
    queryKey: ["mermaid", trimmedValue, resolvedTheme],
    retry: false,
    staleTime: Infinity,
  });

  const lastGood = data ?? lastGoodRef.current;

  if (!trimmedValue) {
    return (
      <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/20 p-6 text-center text-muted-foreground">
        <GhostIcon className="size-6 shrink-0 opacity-40" />
        <span className="text-xs">
          No Mermaid diagram defined. Switch to the &quot;Code&quot; tab to
          write one.
        </span>
      </div>
    );
  }

  if (isPending && !lastGood) {
    return (
      <div className="flex min-h-[220px] w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError && !lastGood) {
    return (
      <>
        <div role="status" aria-live="polite" className="sr-only">
          {error instanceof Error ? error.message : "Syntax error in code"}
        </div>
        <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <AlertCircleIcon className="size-5 shrink-0" />
          <span className="text-xs font-medium">
            Failed to compile Mermaid diagram
          </span>
          <span className="max-w-md text-[11px] opacity-80">
            {error instanceof Error ? error.message : "Syntax error in code"}
          </span>
        </div>
        <pre className="mt-2 max-h-[220px] overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-[11px]">
          <code>{trimmedValue}</code>
        </pre>
      </>
    );
  }

  if (!lastGood) {
    return null;
  }

  return (
    <div className="relative flex size-full min-h-[220px] items-center justify-center overflow-auto p-4">
      <div role="status" aria-live="polite" className="sr-only">
        {isError && (error instanceof Error ? error.message : null)}
      </div>

      {isFetching ? (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-full border bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground shadow-xs backdrop-blur">
          <Spinner className="size-3" />
          <span>Updating...</span>
        </div>
      ) : null}

      {isError ? (
        <div className="text-destructive-foreground absolute inset-x-2 bottom-2 z-10 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span className="truncate">
            {error instanceof Error
              ? error.message
              : "Syntax error in Mermaid code"}
          </span>
        </div>
      ) : null}

      <div
        className="flex size-full items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full"
        aria-label={lastGood.diagramType}
        dangerouslySetInnerHTML={{ __html: lastGood.svg }}
        ref={(e) => {
          if (e === null) {
            return;
          }

          lastGood.bindFunctions?.(e);
        }}
        suppressHydrationWarning
      />
    </div>
  );
};
