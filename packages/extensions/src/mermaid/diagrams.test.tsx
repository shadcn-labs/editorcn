import { act, createElement } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { MermaidDiagrams } from "./diagrams";

vi.mock(import("mermaid"), () => ({
  default: {
    initialize: vi.fn<() => void>(),
    render: vi.fn<(id: string, source: string) => Promise<{ svg: string }>>(
      (_id, source) =>
        source.includes("broken")
          ? Promise.reject(new Error("Parse error"))
          : Promise.resolve({ svg: `<svg data-source="${source}"></svg>` })
    ),
  } as never,
}));

const diagram = (source: string) =>
  `<div data-type="mermaid"><pre><code class="language-mermaid">${source}</code></pre></div>`;

let container: HTMLDivElement;
let root: Root;

const mount = (children: ReactElement) => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(MermaidDiagrams, null, children));
  });
};

const html = (markup: string) =>
  createElement("div", { dangerouslySetInnerHTML: { __html: markup } });

describe(MermaidDiagrams, () => {
  beforeAll(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("draws diagrams in rendered HTML and hides the source", async () => {
    mount(html(diagram("graph TD\n  A--&gt;B")));
    await vi.waitFor(() =>
      expect(container.querySelector("svg")?.dataset.source).toBe(
        "graph TD\n  A-->B"
      )
    );
    expect(container.querySelector("pre")?.hidden).toBeTruthy();
  });

  it("draws diagrams rendered as React elements", async () => {
    mount(
      createElement(
        "div",
        { "data-type": "mermaid" },
        createElement("pre", null, createElement("code", null, "graph LR"))
      )
    );
    await vi.waitFor(() =>
      expect(container.querySelector("svg")?.dataset.source).toBe("graph LR")
    );
  });

  it("keeps the source visible when a diagram fails to render", async () => {
    mount(html(diagram("broken") + diagram("graph RL")));
    await vi.waitFor(() =>
      expect(container.querySelector("svg")?.dataset.source).toBe("graph RL")
    );
    const [failed] = container.querySelectorAll('[data-type="mermaid"]');
    expect(failed?.querySelector("svg")).toBeNull();
    expect(failed?.querySelector("pre")?.hidden).toBeFalsy();
  });
});
