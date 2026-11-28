import { computePosition, flip, shift } from "@floating-ui/dom";
import { posToDOMRect } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import { createElement } from "react";

import { chainFocus } from "../../core/commands";
import { HeadingIcon } from "../../icons/icons";
import type { SlashCommandSuggestionItem } from "./slash-command";
import SuggestionList from "./suggestion-list";
import type {
  SuggestionListHandle,
  SuggestionListProps,
} from "./suggestion-list";

type SuggestionType = Omit<
  SuggestionOptions<SlashCommandSuggestionItem>,
  "editor"
>;

export const defaultSlashCommandItems: SlashCommandSuggestionItem[] = [
  {
    command: ({ editor, range }) => {
      chainFocus(editor)
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
    description: "Just start typing with plain text.",
    id: "text",
    keywords: ["p", "paragraph"],
    title: "Text",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor)
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
    description: "Big section heading.",
    icon: createElement(HeadingIcon, { level: 1 }),
    id: "h1",
    keywords: ["title", "big", "large", "heading"],
    title: "Heading 1",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor)
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
    description: "Medium section heading.",
    icon: createElement(HeadingIcon, { level: 2 }),
    id: "h2",
    keywords: ["subtitle", "medium", "heading"],
    title: "Heading 2",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor)
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
    description: "Small section heading.",
    icon: createElement(HeadingIcon, { level: 3 }),
    id: "h3",
    keywords: ["subtitle", "small", "heading"],
    title: "Heading 3",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).toggleBulletList().run();
    },
    description: "Create a simple bullet list.",
    id: "bulletList",
    keywords: ["unordered", "list", "bullet"],
    title: "Bullet List",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).toggleOrderedList().run();
    },
    description: "Create a list with numbering.",
    id: "orderedList",
    keywords: ["ordered", "list"],
    title: "Numbered List",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).toggleTaskList().run();
    },
    description: "Create a task list with checkboxes.",
    id: "taskList",
    keywords: ["task", "todo", "checkbox"],
    title: "Task List",
  },
  {
    command: ({ editor, range }) =>
      chainFocus(editor)
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
    description: "Capture a quote.",
    id: "blockquote",
    keywords: ["blockquote"],
    title: "Quote",
  },
  {
    command: ({ editor, range }) =>
      chainFocus(editor)
        .deleteRange(range)
        .toggleCodeBlock({ language: "plaintext" })
        .run(),
    description: "Capture a code snippet.",
    id: "codeBlock",
    keywords: ["codeblock"],
    title: "Code",
  },
  {
    command: ({ editor, range }) =>
      chainFocus(editor).deleteRange(range).setHorizontalRule().run(),
    description: "Create a horizontal divider.",
    id: "divider",
    keywords: ["divider"],
    title: "Divider",
  },
];

const updatePosition = async (
  editor: Editor,
  element: Element
): Promise<void> => {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to
      ),
  };

  const {
    x,
    y,
    strategy: posStrategy,
  } = await computePosition(virtualElement, element, {
    middleware: [shift(), flip()],
    placement: "bottom-start",
    strategy: "absolute",
  });
  element.style.width = "max-content";
  element.style.position = posStrategy;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
};

export const getSlashCommandSuggestion = (
  customItems?: SlashCommandSuggestionItem[]
): SuggestionType => {
  const items = customItems
    ? [
        ...customItems,
        ...defaultSlashCommandItems.filter(
          (d) => !customItems.some((c) => c.id === d.id)
        ),
      ]
    : defaultSlashCommandItems;

  return {
    items: ({ query }) =>
      items.filter((item) =>
        item.keywords.some((k) => k.startsWith(query.toLowerCase()))
      ),
    render: () => {
      let component: ReactRenderer<SuggestionListHandle, SuggestionListProps>;

      return {
        onExit() {
          component?.element.remove();
          component?.destroy();
        },

        onKeyDown(props) {
          if (props.event.key === "Escape") {
            return true;
          }
          return component.ref?.onKeyDown(props) ?? false;
        },

        onStart: (props) => {
          component = new ReactRenderer(SuggestionList, {
            editor: props.editor,
            props,
          });

          if (!props.clientRect) {
            return;
          }

          if (component.element instanceof HTMLElement) {
            component.element.style.position = "absolute";
            document.body.append(component.element);
            updatePosition(props.editor, component.element);
          }
        },

        onUpdate(props) {
          component.updateProps(props);
          if (!props.clientRect) {
            return;
          }
          updatePosition(props.editor, component.element);
        },
      };
    },
  };
};
