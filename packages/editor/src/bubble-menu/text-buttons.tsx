import type { Editor } from "@tiptap/react";

import { RteButton, RteButtonGroup, RteIcon } from "../ui";
import { useEditorState, shallowEqual } from "./utils";

const Svg = ({
  children,
  strokeWidth = 2,
}: {
  children: React.ReactNode;
  strokeWidth?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    {children}
  </svg>
);

const Icon = ({ children }: { children: React.ReactNode }) => (
  <RteIcon>{children}</RteIcon>
);

interface TextSelectorResult {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isCode: boolean;
}

interface ToggleableChain {
  run(): boolean;
  toggleBold(): ToggleableChain;
  toggleCode(): ToggleableChain;
  toggleItalic(): ToggleableChain;
  toggleStrike(): ToggleableChain;
  toggleUnderline(): ToggleableChain;
}

const textItems = [
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleBold().run(),
    icon: (
      <Icon>
        <Svg>
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </Svg>
      </Icon>
    ),
    isActive: (s: TextSelectorResult) => s.isBold,
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleItalic().run(),
    icon: (
      <Icon>
        <Svg>
          <line x1="19" y1="4" x2="10" y2="4" />
          <line x1="14" y1="20" x2="5" y2="20" />
          <line x1="15" y1="4" x2="9" y2="20" />
        </Svg>
      </Icon>
    ),
    isActive: (s: TextSelectorResult) => s.isItalic,
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleUnderline().run(),
    icon: (
      <Icon>
        <Svg>
          <path d="M6 4v6a6 6 0 0 0 12 0V4" />
          <line x1="4" y1="20" x2="20" y2="20" />
        </Svg>
      </Icon>
    ),
    isActive: (s: TextSelectorResult) => s.isUnderline,
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleStrike().run(),
    icon: (
      <Icon>
        <Svg>
          <path d="M16 4H9.5a3.5 3.5 0 0 0-2.9 5.4" />
          <path d="M14.5 14.6a3.5 3.5 0 0 1-2.9 5.4H8" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </Svg>
      </Icon>
    ),
    isActive: (s: TextSelectorResult) => s.isStrike,
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleCode().run(),
    icon: (
      <Icon>
        <Svg>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </Svg>
      </Icon>
    ),
    isActive: (s: TextSelectorResult) => s.isCode,
  },
];

export const TextButtons = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState(
    editor,
    (ed) => ({
      isBold: ed.isActive("bold"),
      isCode: ed.isActive("code"),
      isItalic: ed.isActive("italic"),
      isStrike: ed.isActive("strike"),
      isUnderline: ed.isActive("underline"),
    }),
    shallowEqual
  );

  return (
    <RteButtonGroup>
      {textItems.map((item, i) => (
        <RteButton
          key={i}
          active={item.isActive(editorState)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => item.command(editor)}
        >
          {item.icon}
        </RteButton>
      ))}
    </RteButtonGroup>
  );
};
