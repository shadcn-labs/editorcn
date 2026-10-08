"use client";

import { RichTextEditor } from "@editorcn/editor";
import type { Editor } from "@tiptap/react";
import {
  AlignLeft,
  Ban,
  Baseline,
  ChevronDown,
  Code2,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  ListTodo,
  Minus,
  Plus,
  Quote,
  Table as TableIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  ACTIVE_ITEM,
  ALIGNMENTS,
  CANVAS,
  FONTS,
  HIGHLIGHTS,
  SCROLL_SHADOWS,
  TEXT_COLORS,
  TEXT_STYLES,
} from "./constants";
import type { EditorSnapshot } from "./utils";

const TextStyleMenu = ({
  editor,
  value,
}: {
  editor: Editor | null;
  value: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        className="h-8 w-[6.5rem] justify-between px-2 text-[13px]"
        size="sm"
        variant="ghost"
      >
        {TEXT_STYLES.find((s) => s.value === value)?.label}
        <ChevronDown className="text-muted-foreground size-3.5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="min-w-32 p-1">
      <DropdownMenuRadioGroup
        className="flex flex-col gap-0.5"
        value={value}
        onValueChange={(next) => {
          const level = Number(next) as 0 | 1 | 2 | 3;
          const chain = editor?.chain().focus();
          (level ? chain?.setHeading({ level }) : chain?.setParagraph())?.run();
        }}
      >
        {TEXT_STYLES.map((style) => (
          <DropdownMenuRadioItem
            key={style.value}
            className={cn(ACTIVE_ITEM, style.className)}
            value={style.value}
          >
            {style.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

const AlignMenu = ({
  editor,
  value,
}: {
  editor: Editor | null;
  value: string;
}) => {
  const Icon = ALIGNMENTS.find((a) => a.value === value)?.Icon ?? AlignLeft;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Text alignment"
          className="text-muted-foreground h-8 gap-0.5 px-1.5"
          size="sm"
          variant="ghost"
        >
          <Icon />
          <ChevronDown className="size-3!" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-28 p-1">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          value={value}
          onValueChange={(next) =>
            editor?.chain().focus().setTextAlign(next).run()
          }
        >
          {ALIGNMENTS.map(({ Icon: ItemIcon, label, value: v }) => (
            <DropdownMenuRadioItem key={v} className={ACTIVE_ITEM} value={v}>
              <ItemIcon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontMenu = ({
  editor,
  value,
}: {
  editor: Editor | null;
  value: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        aria-label="Font"
        className="h-8 w-[4.5rem] justify-between px-2 text-[13px]"
        size="sm"
        variant="ghost"
      >
        <span style={{ fontFamily: value || undefined }}>
          {FONTS.find((f) => f.value === value)?.label ?? "Sans"}
        </span>
        <ChevronDown className="text-muted-foreground size-3.5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="min-w-28 p-1">
      <DropdownMenuRadioGroup
        className="flex flex-col gap-0.5"
        value={value}
        onValueChange={(next) => {
          const chain = editor?.chain().focus();
          (next ? chain?.setFontFamily(next) : chain?.unsetFontFamily())?.run();
        }}
      >
        {FONTS.map((font) => (
          <DropdownMenuRadioItem
            key={font.label}
            className={ACTIVE_ITEM}
            style={{ fontFamily: font.value || undefined }}
            value={font.value}
          >
            {font.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Swatch = ({
  active,
  color,
  label,
  onClick,
}: {
  active: boolean;
  color?: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    aria-label={label}
    aria-pressed={active}
    className={cn(
      "relative flex size-6 items-center justify-center rounded-full border transition-transform active:scale-96",
      active && "ring-ring ring-2 ring-offset-1 ring-offset-background"
    )}
    onClick={onClick}
    style={{ background: color }}
    title={label}
    type="button"
  >
    {!color && <Ban className="text-muted-foreground size-3.5" />}
  </button>
);

const ColorMenu = ({
  editor,
  highlight,
  text,
}: {
  editor: Editor | null;
  highlight?: string;
  text?: string;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        aria-label="Text color"
        className="h-8 flex-col gap-0 px-1.5"
        size="sm"
        variant="ghost"
      >
        <Baseline className="size-4" />
        <span
          className="-mt-0.5 h-1 w-4 rounded-full"
          style={{ background: highlight ?? text ?? "currentColor" }}
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-auto space-y-3 p-3">
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Text</p>
        <div className="flex gap-1.5">
          <Swatch
            active={!text}
            label="Default text color"
            onClick={() => editor?.chain().focus().unsetColor().run()}
          />
          {TEXT_COLORS.map(({ label, value }) => (
            <Swatch
              key={value}
              active={text === value}
              color={value}
              label={label}
              onClick={() => editor?.chain().focus().setColor(value).run()}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Highlight</p>
        <div className="flex gap-1.5">
          <Swatch
            active={!highlight}
            label="No highlight"
            onClick={() => editor?.chain().focus().unsetHighlight().run()}
          />
          {HIGHLIGHTS.map(({ label, value }) => (
            <Swatch
              key={value}
              active={highlight === value}
              color={value}
              label={label}
              onClick={() =>
                editor?.chain().focus().setHighlight({ color: value }).run()
              }
            />
          ))}
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

const InsertMenu = ({ editor }: { editor: Editor | null }) => {
  const run = (command: (chain: ReturnType<Editor["chain"]>) => void) => {
    if (editor) {
      command(editor.chain().focus());
    }
  };
  const items = [
    {
      Icon: ImageIcon,
      label: "Image",
      onSelect: () => run((c) => c.insertImagePlaceholder().run()),
    },
    {
      Icon: TableIcon,
      label: "Table",
      onSelect: () =>
        run((c) =>
          c.insertTable({ cols: 3, rows: 3, withHeaderRow: true }).run()
        ),
    },
    {
      Icon: Quote,
      label: "Quote",
      onSelect: () => run((c) => c.toggleBlockquote().run()),
    },
    {
      Icon: Code2,
      label: "Code block",
      onSelect: () => run((c) => c.toggleCodeBlock().run()),
    },
    {
      Icon: Minus,
      label: "Divider",
      onSelect: () => run((c) => c.setHorizontalRule().run()),
    },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 gap-1 px-2 text-[13px]"
          size="sm"
          variant="ghost"
        >
          <Plus className="size-4" />
          Insert
          <ChevronDown className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36 p-1">
        {items.map(({ Icon, label, onSelect }) => (
          <DropdownMenuItem
            key={label}
            className="rounded-md py-1 text-[13px] [&_svg]:size-3.5!"
            onClick={onSelect}
          >
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ListControls = ({
  editor,
  state,
}: {
  editor: Editor | null;
  state: EditorSnapshot | null;
}) => {
  const listCommand = (command: "liftListItem" | "sinkListItem") => {
    const chain = editor?.chain().focus();
    (editor?.can()[command]("listItem")
      ? chain?.[command]("listItem")
      : chain?.[command]("taskItem")
    )?.run();
  };
  return (
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.BulletList />
      <RichTextEditor.OrderedList />
      <RichTextEditor.Control
        active={state?.taskList}
        aria-label="Task list"
        title="Task list"
        onClick={() => editor?.chain().focus().toggleTaskList().run()}
      >
        <ListTodo className="size-4" />
      </RichTextEditor.Control>
      <RichTextEditor.Control
        aria-label="Outdent"
        disabled={!state?.canOutdent}
        title="Outdent"
        onClick={() => listCommand("liftListItem")}
      >
        <IndentDecrease className="size-4" />
      </RichTextEditor.Control>
      <RichTextEditor.Control
        aria-label="Indent"
        disabled={!state?.canIndent}
        title="Indent"
        onClick={() => listCommand("sinkListItem")}
      >
        <IndentIncrease className="size-4" />
      </RichTextEditor.Control>
      <AlignMenu editor={editor} value={state?.align ?? "left"} />
    </RichTextEditor.ControlsGroup>
  );
};

export const Toolbar = ({
  editor,
  state,
}: {
  editor: Editor | null;
  state: EditorSnapshot | null;
}) => (
  <div className={cn("sticky top-0 z-10 px-3 pt-3 pb-1", CANVAS)}>
    <div
      className="mx-auto w-fit max-w-full overflow-x-auto rounded-xl border shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={SCROLL_SHADOWS}
    >
      <RichTextEditor.Toolbar className="w-max flex-nowrap! justify-start! border-0! bg-transparent! px-1! py-1! [&>*]:shrink-0">
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <TextStyleMenu editor={editor} value={state?.heading ?? "0"} />
          <FontMenu editor={editor} value={state?.font ?? ""} />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.Code />
          <ColorMenu
            editor={editor}
            highlight={state?.highlight}
            text={state?.color}
          />
          <RichTextEditor.Link />
          <RichTextEditor.Superscript />
          <RichTextEditor.Subscript />
          <RichTextEditor.ClearFormatting />
        </RichTextEditor.ControlsGroup>
        <span aria-hidden className="bg-border mx-1 h-4 w-px" />
        <ListControls editor={editor} state={state} />
        <RichTextEditor.ControlsGroup>
          <InsertMenu editor={editor} />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
    </div>
  </div>
);
