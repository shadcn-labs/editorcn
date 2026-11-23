import { useEffect, useMemo, useState } from "react";

import { BubbleMenu } from "./bubble-menu/index";
import {
  RichTextEditorControl,
  RichTextEditorTooltip,
} from "./controls/rte-control";
import * as controls from "./controls/rte-controls";
import { LinkControl } from "./controls/rte-link-control";
import { TwitterEmbedControl } from "./controls/rte-twitter-control";
import { YouTubeEmbedControl } from "./controls/rte-youtube-control";
import { DEFAULT_ICONS } from "./icons";
import { DEFAULT_LABELS } from "./labels";
import { Content } from "./rte-content";
import { RichTextEditorContext } from "./rte-context";
import { ControlsGroup } from "./rte-controls-group";
import { Footer } from "./rte-footer";
import { Toolbar } from "./rte-toolbar";
import type { RichTextEditorProps } from "./types";
import {
  createTooltipHandle,
  TooltipHost,
  TooltipProvider,
} from "./ui/tooltip";
import { cn } from "./ui/utils";

const RichTextEditorRoot = ({
  editor,
  children,
  className,
  labels,
  icons,
  variant = "default",
  editable = true,
}: RichTextEditorProps) => {
  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels]
  );

  const mergedIcons = useMemo(() => ({ ...DEFAULT_ICONS, ...icons }), [icons]);
  const [tooltip] = useState(createTooltipHandle);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <RichTextEditorContext.Provider
      value={{
        editable,
        editor,
        icons: mergedIcons,
        labels: mergedLabels,
        tooltip,
        variant,
      }}
    >
      <div
        className={cn(
          "rte-root relative rounded-xl border border-(--rte-hairline) bg-background [--rte-float-shadow:0_8px_30px_-12px_rgb(0_0_0/0.15)] [--rte-hairline:color-mix(in_srgb,var(--border)_60%,transparent)] [--rte-strip:color-mix(in_srgb,var(--muted)_50%,var(--background))] [transition:border-color_150ms_ease-out] [&_.rte-editor-icon]:size-4 [&_.rte-editor-icon]:shrink-0",
          variant === "default" && "bg-(--rte-strip) p-1",
          variant !== "default" && `rte-root--${variant}`,
          variant === "compact" &&
            "rounded-lg data-[variant=compact]:[&_.rte-editor-icon]:size-3.5",
          className
        )}
        data-variant={variant}
      >
        <TooltipProvider>
          <TooltipHost handle={tooltip} side="bottom">
            {children}
          </TooltipHost>
        </TooltipProvider>
      </div>
    </RichTextEditorContext.Provider>
  );
};

export const RichTextEditor = Object.assign(RichTextEditorRoot, {
  AlignCenter: controls.AlignCenterControl,
  AlignJustify: controls.AlignJustifyControl,
  AlignLeft: controls.AlignLeftControl,
  AlignRight: controls.AlignRightControl,
  Blockquote: controls.BlockquoteControl,
  Bold: controls.BoldControl,
  BubbleMenu,
  BulletList: controls.BulletListControl,
  ClearFormatting: controls.ClearFormattingControl,
  Code: controls.CodeControl,
  CodeBlock: controls.CodeBlockControl,
  Content,
  Control: RichTextEditorControl,
  ControlsGroup,
  Footer,
  H1: controls.H1Control,
  H2: controls.H2Control,
  H3: controls.H3Control,
  H4: controls.H4Control,
  H5: controls.H5Control,
  H6: controls.H6Control,
  Highlight: controls.HighlightControl,
  Hr: controls.HrControl,
  Italic: controls.ItalicControl,
  Link: LinkControl,
  OrderedList: controls.OrderedListControl,
  Redo: controls.RedoControl,
  Strikethrough: controls.StrikethroughControl,
  Subscript: controls.SubscriptControl,
  Superscript: controls.SuperscriptControl,
  Toolbar,
  Tooltip: RichTextEditorTooltip,
  TwitterEmbed: TwitterEmbedControl,
  Underline: controls.UnderlineControl,
  Undo: controls.UndoControl,
  Unlink: controls.UnlinkControl,
  YouTubeEmbed: YouTubeEmbedControl,
});
