import { useMemo, useEffect } from "react";

import { BubbleMenu } from "./bubble-menu/index";
import { RichTextEditorControl } from "./controls/rte-control";
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
        variant,
      }}
    >
      <div
        className={cn(
          "rte-root",
          variant !== "default" && `rte-root--${variant}`,
          className
        )}
        data-variant={variant}
      >
        {children}
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
  TwitterEmbed: TwitterEmbedControl,
  Underline: controls.UnderlineControl,
  Undo: controls.UndoControl,
  Unlink: controls.UnlinkControl,
  YouTubeEmbed: YouTubeEmbedControl,
});
