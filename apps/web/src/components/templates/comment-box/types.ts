import type { JSONContent } from "@tiptap/core";

export interface CommentAuthor {
  avatar?: string;
  id: string;
  name: string;
}

export interface CommentReaction {
  count: number;
  emoji: string;
  reacted?: boolean;
}

export interface CommentReply {
  author: CommentAuthor;
  createdAt: string;
  content: JSONContent;
  id: string;
  reactions?: CommentReaction[];
}

export interface CommentItem extends CommentReply {
  replies?: CommentReply[];
}

export interface CommentBoxProps {
  className?: string;
  currentUser?: CommentAuthor;
  initialComments?: CommentItem[];
  onDelete?: (id: string) => void;
  onPost?: (content: JSONContent, parentId?: string) => void;
  onReact?: (id: string, emoji: string) => void;
  placeholder?: string;
  title?: string;
}

export interface ThreadActions {
  currentUser: CommentAuthor;
  post: (content: JSONContent, parentId?: string) => void;
  react: (id: string, emoji: string) => void;
  remove: (id: string) => void;
}
