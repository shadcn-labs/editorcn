"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "../ui/utils";

type MermaidTheme = "dark" | "default";

const RENDER_DELAY = 300;
const CACHE_LIMIT = 100;

const cache = new Map<string, string>();
let queue: Promise<unknown> = Promise.resolve();
let renderCount = 0;

const settled = async (promise: Promise<unknown>) => {
  try {
    return await promise;
  } catch (error) {
    return error;
  }
};

const renderDiagram = (source: string, theme: MermaidTheme) => {
  const previous = queue;
  const task = (async () => {
    await previous;
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      securityLevel: "strict",
      startOnLoad: false,
      suppressErrorRendering: true,
      theme,
    });
    renderCount += 1;
    const { svg } = await mermaid.render(`ext-mermaid-${renderCount}`, source);
    return svg;
  })();
  queue = settled(task);
  return task;
};

const remember = (key: string, svg: string) => {
  cache.delete(key);
  cache.set(key, svg);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
};

const subscribeToTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["class"],
    attributes: true,
  });
  return () => observer.disconnect();
};

const useMermaidTheme = (): MermaidTheme =>
  useSyncExternalStore(
    subscribeToTheme,
    () =>
      document.documentElement.classList.contains("dark") ? "dark" : "default",
    () => "default"
  );

interface RenderState {
  error?: string;
  key: string;
  svg?: string;
}

export interface MermaidPreviewProps {
  className?: string;
  value: string | null;
}

export const MermaidPreview = ({ className, value }: MermaidPreviewProps) => {
  const source = value?.trim() ?? "";
  const theme = useMermaidTheme();
  const key = `${theme}\n${source}`;
  const [state, setState] = useState<RenderState>(() => ({
    key,
    svg: cache.get(key),
  }));
  const rendered = useRef(Boolean(state.svg));

  useEffect(() => {
    if (!source) {
      return;
    }
    if (cache.has(key)) {
      rendered.current = true;
      return;
    }
    let cancelled = false;
    const timer = setTimeout(
      async () => {
        try {
          const svg = await renderDiagram(source, theme);
          remember(key, svg);
          if (!cancelled) {
            rendered.current = true;
            setState({ key, svg });
          }
        } catch (error) {
          if (!cancelled) {
            setState((current) => ({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to render diagram",
              key,
              svg: current.svg,
            }));
          }
        }
      },
      rendered.current ? RENDER_DELAY : 0
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, source, theme]);

  if (!source) {
    return (
      <div
        className={cn(
          "ext-mermaid-empty flex min-h-32 items-center justify-center p-6 text-center text-xs text-muted-foreground",
          className
        )}
      >
        Empty diagram. Open the Code tab to write one.
      </div>
    );
  }

  const error = state.key === key ? state.error : undefined;
  const svg = cache.get(key) ?? state.svg;

  if (!svg) {
    return (
      <div className={cn("ext-mermaid-fallback", className)}>
        <output
          className={cn(
            "block px-4 pt-3 font-mono text-xs whitespace-pre-wrap",
            error ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {error ?? "Rendering diagram..."}
        </output>
        <pre className="m-0 overflow-x-auto bg-transparent p-4 font-mono text-xs">
          <code>{source}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={cn("ext-mermaid-preview flex flex-col", className)}>
      {error && (
        <output className="ext-mermaid-error block px-4 pt-3 font-mono text-xs whitespace-pre-wrap text-destructive">
          {error}
        </output>
      )}
      <div
        className={cn(
          "ext-mermaid-svg flex justify-center overflow-auto p-4 [&_svg]:h-auto [&_svg]:max-w-full",
          error && "opacity-50"
        )}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};
