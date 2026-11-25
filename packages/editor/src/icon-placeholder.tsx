import type { LucideProps } from "lucide-react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Italic,
  Link,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  TextQuote,
  Underline,
  Undo2,
} from "lucide-react";

const ICONS = {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Italic,
  Link,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  TextQuote,
  Underline,
  Undo2,
};

type IconPlaceholderProps = LucideProps & {
  lucide: keyof typeof ICONS;
  tabler: string;
  hugeicons: string;
  phosphor: string;
  remixicon: string;
};

export const IconPlaceholder = ({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  ...props
}: IconPlaceholderProps) => {
  const Icon = ICONS[lucide];
  return <Icon {...props} />;
};
