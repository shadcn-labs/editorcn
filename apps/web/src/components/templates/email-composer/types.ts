import type { JSONContent } from "@tiptap/core";

export interface EmailMessage {
  content: JSONContent;
  subject: string;
  to: string;
}

export interface EmailComposerProps {
  className?: string;
  initialContent?: JSONContent;
  initialSubject?: string;
  initialTo?: string;
  onDiscard?: () => void;
  onSend?: (message: EmailMessage) => Promise<void> | void;
  placeholder?: string;
  title?: string;
}
