import { InputRule, Node, isNodeActive, mergeAttributes } from "@tiptap/core";
import { findWrapping } from "@tiptap/pm/transform";
import { ReactNodeViewRenderer } from "@tiptap/react";

import {
  ALERT_BY_VARIANT,
  alertToVariant,
  findCallout,
  isCalloutVariant,
  toCalloutVariant,
  unwrapCallout,
} from "./utils";
import type { CalloutAttributes } from "./utils";
import { CalloutView } from "./view";

export {
  CALLOUT_VARIANTS,
  isCalloutVariant,
  toCalloutVariant,
  alertToVariant,
  findCallout,
  unwrapCallout,
} from "./utils";
export type { CalloutAttributes, CalloutVariant } from "./utils";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: CalloutAttributes) => ReturnType;
      toggleCallout: (attributes?: CalloutAttributes) => ReturnType;
      unsetCallout: () => ReturnType;
      updateCallout: (attributes: CalloutAttributes) => ReturnType;
    };
  }
}

const ALERT_INPUT = /^>?\s?\[!(\w+)\]\s$/;
const ALERT_BLOCK =
  /^ {0,3}>[ \t]*\[!(\w+)\][ \t]*(?:\n|$)((?: {0,3}>.*(?:\n|$))*)/;
const ALERT_START = /^ {0,3}>[ \t]*\[!(\w+)\]/gm;

const findAlertStart = (src: string) => {
  for (const match of src.matchAll(ALERT_START)) {
    if (alertToVariant(match[1])) {
      return match.index;
    }
  }
  return -1;
};

const isValidVariant = ({ variant }: CalloutAttributes) =>
  variant === undefined || isCalloutVariant(variant);

export const Callout = Node.create<CalloutOptions>({
  addAttributes() {
    return {
      emoji: {
        default: null,
        parseHTML: (element) => element.dataset.emoji || null,
        renderHTML: (attributes) =>
          attributes.emoji ? { "data-emoji": attributes.emoji } : {},
      },
      variant: {
        default: "info",
        parseHTML: (element) => toCalloutVariant(element.dataset.variant),
        renderHTML: (attributes) => ({ "data-variant": attributes.variant }),
      },
    };
  },
  addCommands() {
    return {
      setCallout:
        (attributes = {}) =>
        ({ commands }) =>
          isValidVariant(attributes) && commands.wrapIn(this.name, attributes),
      toggleCallout:
        (attributes = {}) =>
        ({ commands, state }) =>
          isNodeActive(state, this.type) &&
          findCallout(state.selection, this.name)
            ? commands.unsetCallout()
            : commands.setCallout(attributes),
      unsetCallout:
        () =>
        ({ state, tr, dispatch }) => {
          const callout = findCallout(state.selection, this.name);
          if (!callout) {
            return false;
          }
          if (!dispatch) {
            return true;
          }
          return unwrapCallout(tr, callout.pos, callout.node);
        },
      updateCallout:
        (attributes) =>
        ({ state, tr, dispatch }) => {
          const callout = findCallout(state.selection, this.name);
          if (!(callout && isValidVariant(attributes))) {
            return false;
          }
          if (dispatch) {
            tr.setNodeMarkup(callout.pos, undefined, {
              ...callout.node.attrs,
              ...attributes,
            });
          }
          return true;
        },
    };
  },
  addInputRules() {
    return [
      new InputRule({
        find: ALERT_INPUT,
        handler: ({ state, range, match }) => {
          const variant = alertToVariant(match[1]);
          if (!variant) {
            return null;
          }
          const { tr } = state;
          tr.delete(range.from, range.to);
          const $start = tr.doc.resolve(range.from);
          const parentDepth = $start.depth - 1;
          const parent = $start.node(parentDepth);
          if (
            parentDepth > 0 &&
            parent.type.name === "blockquote" &&
            $start.index(parentDepth) === 0
          ) {
            tr.setNodeMarkup($start.before(parentDepth), this.type, {
              variant,
            });
            return;
          }
          const blockRange = $start.blockRange();
          const wrapping =
            blockRange && findWrapping(blockRange, this.type, { variant });
          if (!(blockRange && wrapping)) {
            return null;
          }
          tr.wrap(blockRange, wrapping);
        },
      }),
    ];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { $from, empty } = this.editor.state.selection;
        const depth = $from.depth - 1;
        if (
          !empty ||
          depth < 1 ||
          !$from.parent.isTextblock ||
          $from.parent.content.size > 0 ||
          $from.node(depth).type !== this.type
        ) {
          return false;
        }
        const isLast = $from.index(depth) === $from.node(depth).childCount - 1;
        return isLast
          ? this.editor.commands.lift(this.name)
          : this.editor.commands.splitBlock();
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
  addOptions() {
    return { HTMLAttributes: {} };
  },
  content: "block+",
  defining: true,
  group: "block",
  markdownTokenName: "callout",
  markdownTokenizer: {
    level: "block",
    name: "callout",
    start: findAlertStart,
    tokenize: (src, _tokens, lexer) => {
      const match = ALERT_BLOCK.exec(src);
      const variant = match && alertToVariant(match[1]);
      if (!(match && variant)) {
        return;
      }
      const body = (match[2] ?? "")
        .split("\n")
        .map((line) => line.replace(/^ {0,3}> ?/, ""))
        .join("\n");
      return {
        raw: match[0],
        tokens: lexer.blockTokens(body),
        type: "callout",
        variant,
      };
    },
  },
  name: "callout",
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },
  parseMarkdown: (token, helpers) => {
    const content = helpers.parseChildren(token.tokens ?? []);
    return helpers.createNode(
      "callout",
      { variant: token.variant },
      content.length > 0 ? content : [{ type: "paragraph" }]
    );
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      // data-type stays first in the output and can't be overridden.
      mergeAttributes(
        { "data-type": "callout" },
        this.options.HTMLAttributes,
        HTMLAttributes,
        { "data-type": "callout" }
      ),
      0,
    ];
  },
  renderMarkdown: (node, helpers) => {
    const variant = isCalloutVariant(node.attrs?.variant)
      ? node.attrs.variant
      : "info";
    const lines = [`> [!${ALERT_BY_VARIANT[variant]}]`];
    for (const [index, child] of (node.content ?? []).entries()) {
      if (index > 0) {
        lines.push(">");
      }
      const text =
        helpers.renderChild?.(child, index) ?? helpers.renderChildren([child]);
      for (const line of text.split("\n")) {
        lines.push(line === "" ? ">" : `> ${line}`);
      }
    }
    return lines.join("\n");
  },
});
