"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "../ui/utils";
import { renderCached, useMermaidTheme } from "./render";
import type { MermaidTheme } from "./render";

const SOURCE_SELECTOR = 'div[data-type="mermaid"] > pre > code';

const SVG_CLASS =
  "ext-mermaid-svg flex justify-center overflow-auto p-4 [&_svg]:h-auto [&_svg]:max-w-full";

const draw = async (
  block: HTMLElement,
  pre: HTMLElement,
  key: string,
  source: string,
  theme: MermaidTheme
) => {
  let output = block.querySelector<HTMLElement>(":scope > .ext-mermaid-svg");
  try {
    const svg = await renderCached(source, theme);
    if (block.dataset.mermaidKey !== key) {
      return;
    }
    if (!output) {
      output = document.createElement("div");
      output.className = SVG_CLASS;
      block.append(output);
    }
    output.innerHTML = svg;
    pre.hidden = true;
  } catch {
    output?.remove();
    pre.hidden = false;
  }
};

const drawAll = (root: HTMLElement, theme: MermaidTheme) => {
  for (const code of root.querySelectorAll<HTMLElement>(SOURCE_SELECTOR)) {
    const pre = code.parentElement;
    const block = pre?.parentElement;
    const source = code.textContent?.trim();
    if (!pre || !block || !source) {
      continue;
    }
    const key = `${theme}\n${source}`;
    if (block.dataset.mermaidKey === key) {
      continue;
    }
    block.dataset.mermaidKey = key;
    draw(block, pre, key, source, theme);
  }
};

export interface MermaidDiagramsProps {
  children: ReactNode;
  className?: string;
}

export const MermaidDiagrams = ({
  children,
  className,
}: MermaidDiagramsProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useMermaidTheme();

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    drawAll(root, theme);
    const observer = new MutationObserver(() => drawAll(root, theme));
    observer.observe(root, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [theme]);

  return (
    <div ref={ref} className={cn("ext-mermaid-diagrams", className)}>
      {children}
    </div>
  );
};
