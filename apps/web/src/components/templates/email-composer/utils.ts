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
});

// Server-safe: pass these to generateHTML() to turn the body into email HTML.
export const EMAIL_EXTENSIONS = [
  STARTER_KIT,
  Link.configure({ openOnClick: false }),
];

export const FIELD =
  "placeholder:text-muted-foreground/70 h-10 min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm";

export const modKey = () =>
  /Mac|iPhone|iPad/.test(globalThis.navigator?.userAgent ?? "") ? "⌘" : "Ctrl";
