import { Extension, InputRule } from "@tiptap/core";
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import type { DetailsRenderToggleButtonOptions } from "@tiptap/extension-details";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Selection } from "@tiptap/pm/state";

export { DetailsContent, DetailsSummary } from "@tiptap/extension-details";
export type {
  DetailsOptions,
  DetailsRenderToggleButtonOptions,
} from "@tiptap/extension-details";
export { toggleSlashCommandItem } from "./slash-command-item";
export type { ToggleSlashCommandItem } from "./slash-command-item";

// Inline copy of the lucide chevron-right icon. The toggle button is rendered
// by the official vanilla node view, so it needs a plain SVG, not a React node.
const CHEVRON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

const renderToggleButton = ({
  element,
  isOpen,
}: DetailsRenderToggleButtonOptions) => {
  element.className = "ext-toggle-button";
  element.setAttribute(
    "aria-label",
    isOpen ? "Collapse section" : "Expand section"
  );
  if (!element.firstChild) {
    element.innerHTML = CHEVRON_SVG;
  }
};

/**
 * The official `details` node, configured for editorcn:
 *
 * - `persist: true` keeps the open state in the document (`open` attribute in
 *   HTML, `attrs.open` in JSON), and makes the chevron button update the doc.
 * - `+++` on an empty line inserts a toggle.
 * - Enter in the summary opens the toggle and moves the selection into the
 *   content. Backspace at the start of an empty summary unwraps the toggle.
 */
export const ToggleDetails = Details.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /^\+\+\+$/,
        handler: ({ chain, range }) => {
          chain().deleteRange(range).setDetails().run();
        },
      }),
    ];
  },
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: ({ editor }) => {
        const { schema, state, view } = editor;
        const { selection } = state;
        const { empty, $head } = selection;

        if (!empty || $head.parent.type !== schema.nodes.detailsSummary) {
          return false;
        }

        const detailsDepth = $head.depth - 1;
        const detailsPos = $head.before(detailsDepth);
        const details = $head.node(detailsDepth);

        if (detailsDepth < 1 || details.type !== this.type) {
          return false;
        }

        let contentOffset = -1;
        let contentNode: ProseMirrorNode | null = null;
        let offset = 0;
        for (let i = 0; i < details.childCount; i += 1) {
          const child = details.child(i);
          if (contentOffset < 0 && child.type === schema.nodes.detailsContent) {
            contentNode = child;
            contentOffset = offset;
          }
          offset += child.nodeSize;
        }

        if (contentOffset < 0 || !contentNode) {
          return false;
        }

        const content = contentNode;
        const contentStart = detailsPos + 1 + contentOffset + 1;
        const contentChildCount = content.childCount;
        const wasOpen = Boolean(details.attrs.open);

        return editor
          .chain()
          .command(({ dispatch, tr }) => {
            if (!dispatch) {
              return true;
            }
            // Reveal the content in the DOM before the selection moves into
            // it, so the `details` selection guard doesn't bounce the cursor
            // back into the summary. This mirrors what the toggle button node
            // view does on click and is idempotent with its update handler.
            const detailsDom = view.nodeDOM(detailsPos);
            if (detailsDom instanceof HTMLElement) {
              detailsDom.classList.add(this.options.openClassName);
              detailsDom
                .querySelector('div[data-type="detailsContent"]')
                ?.removeAttribute("hidden");
            }
            if (!wasOpen) {
              tr.setNodeMarkup(detailsPos, undefined, {
                ...details.attrs,
                open: true,
              });
            }
            if (contentChildCount === 0) {
              const block = schema.nodes.paragraph?.createAndFill();
              if (block) {
                tr.insert(contentStart, block);
              }
            }
            tr.setSelection(Selection.near(tr.doc.resolve(contentStart), 1));
            tr.scrollIntoView();
            return true;
          })
          .run();
      },
    };
  },
}).configure({
  persist: true,
  renderToggleButton,
});

/**
 * Registers the three nodes a toggle needs: `details`, `detailsSummary`, and
 * `detailsContent`. The node names stay the official ones, so commands are
 * `setDetails` / `unsetDetails` and the HTML output is native
 * `<details>/<summary>`.
 */
export const Toggle = Extension.create({
  addExtensions() {
    return [ToggleDetails, DetailsSummary, DetailsContent];
  },
  name: "toggle",
});
