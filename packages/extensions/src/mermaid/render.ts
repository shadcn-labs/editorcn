import { useSyncExternalStore } from "react";

export type MermaidTheme = "dark" | "default";

const CACHE_LIMIT = 100;

export const cache = new Map<string, string>();
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

export const remember = (key: string, svg: string) => {
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

export const useMermaidTheme = (): MermaidTheme =>
  useSyncExternalStore(
    subscribeToTheme,
    () =>
      document.documentElement.classList.contains("dark") ? "dark" : "default",
    () => "default"
  );

export const renderCached = async (source: string, theme: MermaidTheme) => {
  const key = `${theme}\n${source}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  const svg = await renderDiagram(source, theme);
  remember(key, svg);
  return svg;
};
