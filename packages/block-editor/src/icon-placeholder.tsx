import type { LucideProps } from "lucide-react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Check,
  ChevronDown,
  Code,
  Copy,
  FileText,
  GripVertical,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  Link2Off,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Plus,
  Search,
  SquareCode,
  Strikethrough,
  Table,
  TextQuote,
  Trash2,
  Type,
  Underline,
} from "lucide-react";

const ICONS = {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Check,
  ChevronDown,
  Code,
  Copy,
  FileText,
  GripVertical,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  Link2Off,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Plus,
  Search,
  SquareCode,
  Strikethrough,
  Table,
  TextQuote,
  Trash2,
  Type,
  Underline,
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
