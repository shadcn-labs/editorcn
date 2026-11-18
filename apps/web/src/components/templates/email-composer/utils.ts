import { Link } from "@tiptap/extension-link";
import { StarterKit } from "@tiptap/starter-kit";

export const STARTER_KIT = StarterKit.configure({
  blockquote: false,
  code: false,
  codeBlock: false,
  heading: false,
  horizontalRule: false,
  link: false,
  strike: false,
  trailingNode: false,
});

// Server-safe: pass these to generateHTML() to turn the body into email HTML.
export const EMAIL_EXTENSIONS = [
  STARTER_KIT,
  Link.configure({ openOnClick: false }),
];

export const ROW =
  "border-border/60 flex shrink-0 items-center gap-3 border-b px-4";

export const LABEL = "text-muted-foreground w-14 shrink-0 text-sm";

export const FIELD =
  "placeholder:text-muted-foreground/70 h-10 min-w-0 flex-1 bg-transparent text-base outline-none disabled:opacity-50 sm:text-sm";
