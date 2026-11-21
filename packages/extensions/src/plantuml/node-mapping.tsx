import { renderToString } from "@plantuml/core";
import "@plantuml/core/viz-global.js";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, GhostIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef } from "react";

import { Spinner } from "@editorcn/ui/components/spinner";

import { type PlantUMLAttributes } from "./types";

export const NodeMapping = (attrs: PlantUMLAttributes) => {
  const { resolvedTheme } = useTheme();

  const trimmedValue = attrs.value?.trim() ?? "";

  const lastGoodRef = useRef<string | null>(null);

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["plantuml", trimmedValue, resolvedTheme],
    queryFn: async (): Promise<string> => {
      if (!trimmedValue) {
        throw new Error("Diagram code not provided");
      }

      return new Promise((resolve, reject) => {
        renderToString(
          trimmedValue.split("\n"),
          (svg: string) => {
            lastGoodRef.current = svg;
            resolve(svg);
          },
          (message: unknown) => {
            const errorMsg =
              typeof message === "string"
                ? message
                : message instanceof Error
                  ? message.message
                  : "Failed to compile PlantUML diagram";

            reject(new Error(errorMsg));
          },
          { dark: resolvedTheme === "dark" },
        );
      });
    },
    enabled: Boolean(trimmedValue),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

  const lastGood = data ?? lastGoodRef.current;

  if (!trimmedValue) {
    return (
      <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/20 p-6 text-center text-muted-foreground">
        <GhostIcon className="size-6 shrink-0 opacity-40" />
        <span className="text-xs">
          No PlantUML diagram defined. Switch to the "Code" tab to write one.
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
          <span className="text-xs font-medium">Failed to compile PlantUML diagram</span>
          <span className="max-w-md text-[11px] opacity-80">
            {error instanceof Error ? error.message : "Syntax error in code"}
          </span>
        </div>
      </>
    );
  }

  if (!lastGood) {
    return null;
  }

  const svgContent = typeof lastGood === "string" ? lastGood : "";

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
            {error instanceof Error ? error.message : "Syntax error in PlantUML code"}
          </span>
        </div>
      ) : null}

      <div
        className="flex size-full items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        suppressHydrationWarning
      />
    </div>
  );
};
