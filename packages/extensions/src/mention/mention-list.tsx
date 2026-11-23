"use client";

import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";
import {
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { DropdownMenuContent } from "../ui/dropdown-content";
import { DropdownMenuItem } from "../ui/dropdown-item";
import type { MentionItem } from "./index";

interface MentionListOptions {
  heading?: string;
  renderItem?: (item: MentionItem) => ReactNode;
}

type MentionListProps = SuggestionProps<MentionItem, MentionItem> &
  MentionListOptions;

interface MentionListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const AVATAR_CLASS =
  "ext-mention-avatar inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted object-cover text-[0.75rem] font-semibold text-muted-foreground";

const DefaultItem = ({ avatar, description, label }: MentionItem) => {
  const [failed, setFailed] = useState(false);
  return (
    <>
      {avatar && !failed ? (
        <img
          alt=""
          className={AVATAR_CLASS}
          onError={() => setFailed(true)}
          src={avatar}
        />
      ) : (
        <span aria-hidden className={AVATAR_CLASS}>
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="ext-mention-text flex min-w-0 flex-col leading-tight">
        <span className="ext-mention-label truncate text-[0.875rem] font-medium text-popover-foreground">
          {label}
        </span>
        {description && (
          <span className="ext-mention-description truncate text-[0.75rem] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </>
  );
};

const MentionList = forwardRef<MentionListHandle, MentionListProps>(
  ({ command, editor, heading, items, loading, renderItem }, ref) => {
    const listId = useId();
    const [selected, setSelected] = useState(0);
    const [activeItem, setActiveItem] = useState<HTMLElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const [prevItems, setPrevItems] = useState(items);
    if (prevItems !== items) {
      setPrevItems(items);
      setSelected(0);
    }

    useLayoutEffect(() => {
      const item =
        listRef.current?.querySelectorAll<HTMLElement>("[data-dropdown-item]")[
          selected
        ] ?? null;
      setActiveItem(item);
      item?.scrollIntoView({ block: "nearest" });
    }, [items, selected]);

    useLayoutEffect(() => {
      const { dom } = editor.view;
      dom.setAttribute("aria-controls", listId);
      if (items.length > 0) {
        dom.setAttribute("aria-activedescendant", `${listId}-${selected}`);
      }
      return () => {
        dom.removeAttribute("aria-activedescendant");
        dom.removeAttribute("aria-controls");
      };
    }, [editor, items.length, listId, selected]);

    const select = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (items.length === 0) {
          return false;
        }
        if (event.key === "ArrowUp") {
          setSelected((selected + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelected((selected + 1) % items.length);
          return true;
        }
        const composing = event.isComposing || event.keyCode === 229;
        if ((event.key === "Enter" && !composing) || event.key === "Tab") {
          select(selected);
          return true;
        }
        return false;
      },
    }));

    return (
      <DropdownMenuContent
        activeItem={items.length > 0 ? activeItem : null}
        aria-busy={loading}
        className="ext-mention-list z-60 max-h-72 max-w-88 min-w-64 overflow-y-auto"
        id={listId}
        ref={listRef}
        role="listbox"
      >
        {heading && (
          <div className="ext-mention-heading px-2 pt-1.5 pb-1 text-[0.75rem] font-medium text-muted-foreground">
            {heading}
          </div>
        )}
        {items.length === 0 ? (
          <div className="ext-mention-empty px-2 py-1.5 text-[0.8125rem] text-muted-foreground">
            {loading ? "Searching…" : "No results"}
          </div>
        ) : (
          items.map((item, index) => (
            <DropdownMenuItem
              aria-selected={index === selected}
              id={`${listId}-${index}`}
              key={item.id}
              onClick={() => select(index)}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setSelected(index)}
              role="option"
            >
              {renderItem ? renderItem(item) : <DefaultItem {...item} />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    );
  }
);

export const renderMentionList = (
  options: MentionListOptions
): ReturnType<NonNullable<SuggestionOptions<MentionItem>["render"]>> => {
  let component: ReactRenderer<MentionListHandle, MentionListProps> | null =
    null;
  let unmount: (() => void) | null = null;

  return {
    onExit: ({ editor }) => {
      editor.view.dom.removeAttribute("aria-activedescendant");
      editor.view.dom.removeAttribute("aria-controls");
      unmount?.();
      component?.destroy();
      component = null;
      unmount = null;
    },
    onKeyDown: (props) => component?.ref?.onKeyDown(props) ?? false,
    onStart: (props) => {
      component = new ReactRenderer(MentionList, {
        editor: props.editor,
        props: { ...props, ...options },
      });
      unmount = props.mount(component.element as HTMLElement);
    },
    onUpdate: (props) => {
      component?.updateProps({ ...props, ...options });
    },
  };
};
