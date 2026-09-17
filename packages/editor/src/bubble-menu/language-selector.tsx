import type { Editor } from "@tiptap/react";
import { useState } from "react";

import { useRichTextEditorContext } from "../rte-context";
import {
  RteButton,
  RteDropdown,
  RteDropdownIcon,
  RteDropdownItem,
  RteIcon,
  RteOverlay,
} from "../ui";
import {
  CODE_BLOCK_LANGUAGES,
  getLanguageLabel,
  useEditorState,
  shallowEqual,
} from "./utils";

const FallbackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const LanguageSelector = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const { icons } = useRichTextEditorContext();
  const { currentLanguage } = useEditorState(
    editor,
    (ed) => ({
      currentLanguage: ed.getAttributes("codeBlock").language || "javascript",
    }),
    shallowEqual
  );

  const langIcon = icons.languageIcons[currentLanguage] ?? <FallbackIcon />;

  return (
    <div style={{ position: "relative" }}>
      <RteButton
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
      >
        <RteIcon>{langIcon}</RteIcon>
        <span className="rte-bubble-btn-text">
          {getLanguageLabel(currentLanguage)}
        </span>
        <RteIcon style={{ height: 12, width: 12 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </RteIcon>
      </RteButton>
      {open && (
        <>
          <RteOverlay
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <RteDropdown variant="language">
            {CODE_BLOCK_LANGUAGES.map((lang) => (
              <RteDropdownItem
                key={lang}
                active={currentLanguage === lang}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .updateAttributes("codeBlock", { language: lang })
                    .run();
                  setOpen(false);
                }}
              >
                <RteDropdownIcon>
                  {icons.languageIcons[lang] ?? <FallbackIcon />}
                </RteDropdownIcon>
                <span>{getLanguageLabel(lang)}</span>
              </RteDropdownItem>
            ))}
          </RteDropdown>
        </>
      )}
    </div>
  );
};
