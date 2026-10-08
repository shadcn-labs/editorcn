import type { Content, JSONContent } from "@tiptap/core";

export interface DocumentCollaborator {
  name: string;
  src?: string;
}

export interface SimpleDocumentEditorProps {
  className?: string;
  collaborators?: DocumentCollaborator[];
  initialContent?: Content;
  initialTitle?: string;
  onChange?: (content: JSONContent) => void;
  onShare?: () => void;
  onTitleChange?: (title: string) => void;
  path?: string[];
}
