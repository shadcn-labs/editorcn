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

// The button comes from the official vanilla node view, so the icon is an
// inline SVG; CSS rotates it down when open.
const TRIANGLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 1.75v8.5L10.25 6z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';

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
    element.innerHTML = TRIANGLE_SVG;
  }
};

/**
 * The official `details` node with the open state persisted, a `+++` input
 * rule, and Enter in the summary opening the toggle and moving the selection
 * into the content.
 */
export const ToggleDetails = Details.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /^\+\+\+$/,
        handler: ({ can, chain, range }) => {
          // `setDetails` cannot wrap the selection inside a summary; keep the
          // typed text instead of deleting it.
          if (!can().setDetails()) {
            return null;
          }
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

        const detailsDom = view.nodeDOM(detailsPos);
        const buttonDom =
          detailsDom instanceof HTMLElement
            ? detailsDom.querySelector(".ext-toggle-button")
            : null;
        const contentDom =
          detailsDom instanceof HTMLElement
            ? detailsDom.querySelector('div[data-type="detailsContent"]')
            : null;

        // The selection guard in the official extension keeps the content
        // hidden while `attrs.open` is false, so the DOM must be revealed
        // before the selection moves into it.
        const syncDom = (open: boolean) => {
          if (detailsDom instanceof HTMLElement) {
            detailsDom.classList.toggle(this.options.openClassName, open);
          }
          if (buttonDom instanceof HTMLButtonElement) {
            this.options.renderToggleButton({
              element: buttonDom,
              isOpen: open,
              node: details,
            });
          }
          if (open) {
            contentDom?.removeAttribute("hidden");
          } else {
            contentDom?.setAttribute("hidden", "");
          }
        };

        const applied = editor
          .chain()
          .command(({ dispatch, tr }) => {
            if (!dispatch) {
              return true;
            }
            syncDom(true);
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

        // A plugin can reject the dispatched transaction; roll the DOM back
        // so it matches the unchanged document.
        if (!applied || !editor.state.doc.nodeAt(detailsPos)?.attrs.open) {
          syncDom(false);
        }
        return applied;
      },
    };
  },
}).configure({
  persist: true,
  renderToggleButton,
});

/** Registers the `details`, `detailsSummary`, and `detailsContent` nodes. */
export const Toggle = Extension.create({
  addExtensions() {
    return [ToggleDetails, DetailsSummary, DetailsContent];
  },
  name: "toggle",
});
