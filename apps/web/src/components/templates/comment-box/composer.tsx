"use client";

import { RichTextEditor } from "@editorcn/editor";
import type { JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Check,
  Code,
  Italic,
  List,
  Strikethrough,
  Type,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

import type { CommentAuthor } from "./types";
import { EXTENSIONS, ITEM, initials } from "./utils";

export const UserAvatar = ({
  author,
  small = false,
}: {
  author: CommentAuthor;
  small?: boolean;
}) => (
  <Avatar className={small ? "size-7" : "size-8"}>
    {author.avatar && <AvatarImage alt={author.name} src={author.avatar} />}
    <AvatarFallback className="text-xs font-medium">
      {initials(author.name)}
    </AvatarFallback>
  </Avatar>
);

const FORMATS = [
  { Icon: Bold, label: "Bold", mark: "bold", toggle: "toggleBold" },
  { Icon: Italic, label: "Italic", mark: "italic", toggle: "toggleItalic" },
  {
    Icon: Strikethrough,
    label: "Strikethrough",
    mark: "strike",
    toggle: "toggleStrike",
  },
  { Icon: Code, label: "Code", mark: "code", toggle: "toggleCode" },
  {
    Icon: List,
    label: "Bullet list",
    mark: "bulletList",
    toggle: "toggleBulletList",
  },
] as const;

const FormatMenu = ({ editor }: { editor: Editor | null }) => {
  const refocus = useRef(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Formatting"
          className="text-muted-foreground sm:hidden"
          onFocus={() => {
            if (refocus.current) {
              refocus.current = false;
              editor?.commands.focus();
            }
          }}
          size="icon-sm"
          variant="ghost"
        >
          <Type />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40 p-1">
        {FORMATS.map(({ Icon, label, mark, toggle }) => (
          <DropdownMenuItem
            key={mark}
            className={ITEM}
            onClick={() => {
              refocus.current = true;
              editor?.chain().focus()[toggle]().run();
            }}
          >
            <Icon />
            {label}
            {editor?.isActive(mark) && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Composer = ({
  author,
  autoFocus = false,
  className,
  initialContent,
  onCancel,
  onPost,
  placeholder,
  submitLabel = "Comment",
}: {
  author: CommentAuthor;
  autoFocus?: boolean;
  className?: string;
  initialContent?: JSONContent;
  onCancel?: () => void;
  onPost: (content: JSONContent) => void;
  placeholder: string;
  submitLabel?: string;
}) => {
  const handlers = useRef<{ cancel?: () => void; post: () => void } | null>(
    null
  );

  const editor = useEditor({
    autofocus: autoFocus ? "end" : false,
    content: initialContent ?? "",
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === "Escape" && handlers.current?.cancel) {
          handlers.current.cancel();
          return true;
        }
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          handlers.current?.post();
          return true;
        }
        return false;
      },
    },
    extensions: [...EXTENSIONS, Placeholder.configure({ placeholder })],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const isEmpty =
    useEditorState({
      editor,
      selector: ({ editor: e }) => !e || e.isEmpty,
    }) ?? true;

  const post = useCallback(() => {
    if (!editor || editor.isDestroyed || editor.isEmpty) {
      return;
    }
    onPost(editor.getJSON());
    editor.commands.clearContent();
  }, [editor, onPost]);

  useEffect(() => {
    handlers.current = { cancel: onCancel, post };
  }, [onCancel, post]);

  const mod = /Mac|iPhone|iPad/.test(globalThis.navigator?.userAgent ?? "")
    ? "⌘"
    : "Ctrl";

  return (
    <div className={cn("flex gap-3", className)}>
      <div className="hidden sm:block">
        <UserAvatar author={author} />
      </div>
      <RichTextEditor
        editor={editor}
        variant="compact"
        className="bg-background focus-within:border-ring focus-within:ring-ring/20 min-w-0 flex-1 rounded-xl! border shadow-xs transition-shadow focus-within:ring-3"
      >
        <RichTextEditor.Content className="[&_.ProseMirror]:min-h-16! [&_.ProseMirror]:px-3! [&_.ProseMirror]:py-2.5! [&_.ProseMirror]:text-base sm:[&_.ProseMirror]:text-sm" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1.5 pb-1.5">
          <FormatMenu editor={editor} />
          <RichTextEditor.ControlsGroup className="max-sm:hidden!">
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
            <RichTextEditor.BulletList />
          </RichTextEditor.ControlsGroup>
          <div className="ml-auto flex items-center gap-2">
            <KbdGroup className="text-muted-foreground hidden sm:inline-flex">
              <Kbd suppressHydrationWarning>{mod}</Kbd>
              <Kbd>Enter</Kbd>
            </KbdGroup>
            {onCancel && (
              <Button
                className="rounded-lg"
                onClick={onCancel}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            )}
            <Button
              className="rounded-lg"
              disabled={isEmpty}
              onClick={post}
              size="sm"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </RichTextEditor>
    </div>
  );
};
