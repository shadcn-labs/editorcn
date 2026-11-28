"use client";

import type { ReactNodeViewProps } from "@tiptap/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import {
  Braces,
  Captions,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Ellipsis,
  Search,
  Sparkles,
  WrapText,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";

import { useToolbar } from "../core/context";
import { useEditorState } from "../core/editor-state";
import { Button } from "../ui/button";
import { DropdownMenuContent } from "../ui/dropdown-content";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { DropdownMenu } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Popover } from "../ui/popover";
import {
  CODE_BLOCK_LANGUAGES,
  canFormat,
  formatCode,
  getLanguageLabel,
} from "./languages";

type Menu = "actions" | "language" | null;

interface Action {
  icon: ReactNode;
  id: string;
  label: string;
  onSelect: () => void;
  submenu?: boolean;
  trailing?: ReactNode;
}

const useSearchList = <T,>(
  all: T[],
  getLabel: (item: T) => string,
  initialIndex = 0
) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initialIndex);
  const [activeItem, setActiveItem] = useState<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const search = query.trim().toLowerCase();
  const items = all.filter((item) =>
    getLabel(item).toLowerCase().includes(search)
  );

  useLayoutEffect(() => {
    const item =
      listRef.current?.querySelectorAll<HTMLElement>(
        ":scope > [data-dropdown-item]"
      )[selected] ?? null;
    setActiveItem(item);
    item?.scrollIntoView({ block: "nearest" });
  }, [search, selected]);

  const move = (delta: number) => {
    if (items.length > 0) {
      setSelected((selected + delta + items.length) % items.length);
    }
  };

  const setSearch = (value: string) => {
    setQuery(value);
    setSelected(0);
  };

  return {
    activeItem: items.length > 0 ? activeItem : null,
    items,
    listRef,
    move,
    query,
    selected,
    setSearch,
    setSelected,
  };
};

const MENU_LABEL_CLASS =
  "ext-code-block-menu-label px-2 py-1.5 text-[0.75rem] text-muted-foreground";

const TRAILING_CLASS = "ext-code-block-trailing ml-auto";

const TOOLBAR_BUTTON_CLASS = "size-6 rounded-sm [&>svg]:size-3.5";

const SWITCH_CLASS =
  "ext-code-block-switch relative h-4 w-7 rounded-full bg-input [transition:background-color_150ms_ease-out] after:absolute after:top-0.5 after:left-0.5 after:size-3 after:rounded-full after:bg-background after:content-[''] after:[transition:translate_150ms_ease-out] data-checked:bg-primary data-checked:after:translate-x-3";

const SearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <div className="ext-code-block-search sticky top-0 z-2 -mx-1 flex items-center rounded-t-lg bg-popover p-1 [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:left-3 [&>svg]:size-3.5 [&>svg]:text-muted-foreground">
    <Search />
    <Input ref={ref} className="h-8 pl-7" {...props} />
  </div>
));
SearchInput.displayName = "SearchInput";

const LanguageMenu = ({
  value,
  onSelect,
  onBack,
  autoFocus = true,
}: {
  value: string;
  onSelect: (value: string) => void;
  onBack?: () => void;
  autoFocus?: boolean;
}) => {
  const {
    activeItem,
    items,
    listRef,
    move,
    query,
    selected,
    setSearch,
    setSelected,
  } = useSearchList(
    CODE_BLOCK_LANGUAGES,
    (lang) => lang.label,
    Math.max(
      0,
      CODE_BLOCK_LANGUAGES.findIndex((lang) => lang.value === value)
    )
  );
  const { labels } = useToolbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[selected];
      if (item) {
        onSelect(item.value);
      }
    } else if (event.key === "ArrowLeft" && onBack && query === "") {
      event.preventDefault();
      onBack();
    }
  };

  return (
    <div className="ext-code-block-languages w-60 animate-ext-pop-in overflow-hidden rounded-lg bg-popover px-1 pt-0 pb-1 text-popover-foreground shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] ring-1 ring-border/60">
      <SearchInput
        ref={inputRef}
        placeholder={`${labels.searchLanguages}...`}
        aria-label={labels.searchLanguages}
        role="combobox"
        aria-controls={listId}
        aria-expanded
        aria-activedescendant={
          items.length > 0 ? `${listId}-${selected}` : undefined
        }
        value={query}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className={MENU_LABEL_CLASS}>{labels.languages}</div>
      <DropdownMenuContent
        ref={listRef}
        id={listId}
        role="listbox"
        className="ext-code-block-language-list max-h-60 min-w-0 animate-none overflow-y-auto rounded-none bg-transparent p-0 shadow-none ring-0 supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-color:var(--border)_transparent] supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground [&::-webkit-scrollbar-track]:hidden"
        activeItem={activeItem}
      >
        {items.length === 0 && (
          <div className={MENU_LABEL_CLASS}>{labels.noResults}</div>
        )}
        {items.map((lang, index) => (
          <DropdownMenuItem
            key={lang.value}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={lang.value === value}
            onMouseEnter={() => setSelected(index)}
            onClick={() => onSelect(lang.value)}
          >
            <span>{lang.label}</span>
            {lang.value === value && <Check className={TRAILING_CLASS} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </div>
  );
};

const ActionsMenu = ({
  actions,
  language,
  onLanguage,
}: {
  actions: Action[];
  language: string;
  onLanguage: (value: string) => void;
}) => {
  const {
    activeItem,
    items,
    listRef,
    move,
    query,
    selected,
    setSearch,
    setSelected,
  } = useSearchList(actions, (action) => action.label);
  const { labels } = useToolbar();
  const [submenu, setSubmenu] = useState<"focus" | "hover" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = (action: Action, focus: boolean) => {
    if (action.submenu) {
      setSubmenu(focus ? "focus" : "hover");
    } else {
      action.onSelect();
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const action = items[selected];
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setSubmenu(null);
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" && action) {
      event.preventDefault();
      run(action, true);
    } else if (event.key === "ArrowRight" && action?.submenu) {
      event.preventDefault();
      setSubmenu("focus");
    }
  };

  return (
    <DropdownMenuContent
      ref={listRef}
      className="ext-code-block-actions w-64"
      activeItem={activeItem}
    >
      <SearchInput
        ref={inputRef}
        placeholder={`${labels.searchActions}...`}
        aria-label={labels.searchActions}
        value={query}
        onChange={(event) => {
          setSubmenu(null);
          setSearch(event.target.value);
        }}
        onKeyDown={onKeyDown}
      />
      <div className={MENU_LABEL_CLASS}>{labels.code}</div>
      {items.length === 0 && (
        <div className={MENU_LABEL_CLASS}>{labels.noResults}</div>
      )}
      {items.map((action, index) => (
        <DropdownMenuItem
          key={action.id}
          aria-haspopup={action.submenu ? "listbox" : undefined}
          aria-expanded={action.submenu ? submenu !== null : undefined}
          onMouseEnter={() => {
            setSelected(index);
            setSubmenu(action.submenu ? "hover" : null);
          }}
          onClick={() => run(action, true)}
        >
          {action.icon}
          {action.label}
          {action.trailing}
        </DropdownMenuItem>
      ))}
      {submenu && (
        <div
          className="ext-code-block-submenu absolute top-10 right-[calc(100%+0.5rem)]"
          onMouseOver={(event) => event.stopPropagation()}
          onFocus={(event) => event.stopPropagation()}
        >
          <LanguageMenu
            value={language}
            onSelect={onLanguage}
            autoFocus={submenu === "focus"}
            onBack={() => {
              setSubmenu(null);
              inputRef.current?.focus();
            }}
          />
        </div>
      )}
    </DropdownMenuContent>
  );
};

const MermaidPreview = ({ code }: { code: string }) => {
  const { labels } = useToolbar();
  const id = `ext-mermaid-${useId().replaceAll(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code.trim()) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          securityLevel: "strict",
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "default",
        });
        const result = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(result.svg);
          setError(null);
        }
      } catch (error_) {
        if (!cancelled) {
          setError(
            error_ instanceof Error ? error_.message : labels.diagramError
          );
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, id, labels.diagramError]);

  if (!code.trim()) {
    return null;
  }

  return (
    <div className="ext-code-block-mermaid" contentEditable={false}>
      {error && <div className="ext-code-block-mermaid-error">{error}</div>}
      {!error && svg && (
        <div
          className="ext-code-block-mermaid-svg"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {!error && !svg && (
        <div className="ext-code-block-mermaid-status">
          {labels.renderingDiagram}
        </div>
      )}
    </div>
  );
};

export const CodeBlockView = ({
  node,
  editor,
  getPos,
  updateAttributes,
}: ReactNodeViewProps) => {
  const language = (node.attrs.language as string | null) || "plaintext";
  const caption = node.attrs.caption as string | null;
  const code = node.textContent;
  const { labels } = useToolbar();
  const active = useEditorState(editor, (current) => {
    const pos = getPos();
    if (typeof pos !== "number") {
      return false;
    }
    const { from, to } = current.state.selection;
    return from > pos && to < pos + node.nodeSize;
  });
  const [editable, setEditable] = useState(editor.isEditable);
  const [menu, setMenu] = useState<Menu>(null);
  const [copied, setCopied] = useState(false);
  const [viewWrap, setViewWrap] = useState<boolean>();
  const wrap = viewWrap ?? Boolean(node.attrs.wrap);
  const captionRef = useRef<HTMLInputElement>(null);
  const focusCaption = useRef(false);

  const openMenu = (next: Menu) => (open: boolean) =>
    setMenu(open ? next : null);

  useEffect(() => {
    const sync = () => setEditable(editor.isEditable);
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor]);

  useEffect(() => {
    if (focusCaption.current && caption !== null) {
      focusCaption.current = false;
      captionRef.current?.focus();
    }
  }, [caption]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    setMenu(null);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const toggleWrap = () => {
    if (editable) {
      updateAttributes({ wrap: !wrap });
    } else {
      setViewWrap(!wrap);
    }
  };

  const setLanguage = (value: string) => {
    setMenu(null);
    updateAttributes({ language: value });
  };

  const addCaption = () => {
    setMenu(null);
    if (caption === null) {
      focusCaption.current = true;
      updateAttributes({ caption: "" });
    } else {
      captionRef.current?.focus();
    }
  };

  const removeCaption = () => {
    updateAttributes({ caption: null });
    const pos = getPos();
    if (typeof pos === "number") {
      editor.commands.focus(pos + node.nodeSize - 1);
    }
  };

  const format = async () => {
    setMenu(null);
    let formatted = code;
    try {
      formatted = await formatCode(code, language);
    } catch {
      return;
    }
    const pos = getPos();
    if (formatted === code || typeof pos !== "number") {
      return;
    }
    const current = editor.state.doc.nodeAt(pos);
    if (current?.textContent !== code) {
      return;
    }
    editor
      .chain()
      .command(({ tr }) => {
        tr.insertText(formatted, pos + 1, pos + current.nodeSize - 1);
        return true;
      })
      .run();
  };

  const actions: Action[] = [
    ...(editable
      ? [
          {
            icon: <Captions />,
            id: "caption",
            label: labels.caption,
            onSelect: addCaption,
          },
        ]
      : []),
    { icon: <Copy />, id: "copy", label: labels.copyCode, onSelect: copy },
    {
      icon: <WrapText />,
      id: "wrap",
      label: labels.wrapCode,
      onSelect: toggleWrap,
      trailing: (
        <span
          className={`${SWITCH_CLASS} ${TRAILING_CLASS}`}
          data-checked={wrap ? "" : undefined}
        />
      ),
    },
    ...(editable
      ? [
          {
            icon: <Braces />,
            id: "language",
            label: labels.language,
            onSelect: () => setMenu("language"),
            submenu: true,
            trailing: <ChevronRight className={TRAILING_CLASS} />,
          },
        ]
      : []),
    ...(editable && canFormat(language)
      ? [
          {
            icon: <Sparkles />,
            id: "format",
            label: labels.formatCode,
            onSelect: format,
          },
        ]
      : []),
  ];

  return (
    <NodeViewWrapper className="ext-code-block" data-language={language}>
      <div className="ext-code-block-box group/code-block">
        <div
          className="ext-code-block-header pointer-events-none absolute inset-[0.25rem_0.25rem_auto_0.5rem] z-10 flex items-start justify-between opacity-0 [transition:opacity_150ms_ease-out] *:pointer-events-none group-hover/code-block:opacity-100 group-hover/code-block:*:pointer-events-auto focus-within:opacity-100 focus-within:*:pointer-events-auto data-active:opacity-100 data-active:*:pointer-events-auto data-open:opacity-100 data-open:*:pointer-events-auto"
          contentEditable={false}
          data-active={active ? "" : undefined}
          data-open={menu ? "" : undefined}
        >
          {editable ? (
            <DropdownMenu
              open={menu === "language"}
              onOpenChange={openMenu("language")}
              trigger={
                <Button className="ext-code-block-lang h-6 gap-1 rounded-sm px-2 text-[0.8125rem] font-normal text-muted-foreground [&>svg]:size-3.5">
                  {getLanguageLabel(language)}
                  <ChevronDown />
                </Button>
              }
            >
              <LanguageMenu value={language} onSelect={setLanguage} />
            </DropdownMenu>
          ) : (
            <span className="ext-code-block-lang inline-flex h-6 items-center gap-1 px-2 text-[0.8125rem] font-normal text-muted-foreground">
              {getLanguageLabel(language)}
            </span>
          )}
          <div className="ext-code-block-toolbar flex gap-0.5 text-muted-foreground">
            <Button
              size="icon-sm"
              className={TOOLBAR_BUTTON_CLASS}
              tooltip={copied ? labels.copied : labels.copy}
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
            {editable && (
              <Button
                size="icon-sm"
                className={TOOLBAR_BUTTON_CLASS}
                tooltip={labels.caption}
                onClick={addCaption}
              >
                <Captions />
              </Button>
            )}
            <Popover
              align="end"
              open={menu === "actions"}
              onOpenChange={openMenu("actions")}
              trigger={
                <Button
                  size="icon-sm"
                  className={TOOLBAR_BUTTON_CLASS}
                  tooltip={labels.codeActions}
                >
                  <Ellipsis />
                </Button>
              }
            >
              <ActionsMenu
                actions={actions}
                language={language}
                onLanguage={setLanguage}
              />
            </Popover>
          </div>
        </div>
        <pre spellCheck={false}>
          <NodeViewContent<"code">
            as="code"
            style={{ whiteSpace: wrap ? "pre-wrap" : "pre" }}
          />
        </pre>
        {language === "mermaid" && <MermaidPreview code={code} />}
      </div>
      {caption !== null && (
        <div className="ext-code-block-caption" contentEditable={false}>
          {editable ? (
            <input
              ref={captionRef}
              aria-label={labels.caption}
              placeholder={labels.captionPlaceholder}
              value={caption}
              onChange={(event) =>
                updateAttributes({ caption: event.target.value })
              }
              onKeyDown={(event) => {
                if (event.key === "Backspace" && caption === "") {
                  event.preventDefault();
                  removeCaption();
                }
              }}
            />
          ) : (
            caption
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};
