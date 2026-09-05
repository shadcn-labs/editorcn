import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

const defaultEqual = <T>(a: T, b: T) => a === b;

export const shallowEqual = <T extends Record<string, unknown>>(
  a: T,
  b: T
): boolean => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) {
    return false;
  }
  return ak.every((k) => a[k] === b[k]);
};

export const useEditorState = <T>(
  editor: Editor | null,
  selector: (e: Editor) => T,
  isEqual: (a: T, b: T) => boolean = defaultEqual
): T => {
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);

  useEffect(() => {
    selectorRef.current = selector;
    isEqualRef.current = isEqual;
  });

  const snapshotRef = useRef<{ value: T }>({
    value: editor ? selector(editor) : (undefined as unknown as T),
  });

  const updateSnapshot = useCallback(() => {
    if (!editor) {
      return;
    }
    const next = selectorRef.current(editor);
    if (
      snapshotRef.current &&
      isEqualRef.current(snapshotRef.current.value, next)
    ) {
      return;
    }
    snapshotRef.current = { value: next };
  }, [editor]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!editor) {
        return () => {
          // noop
        };
      }
      const update = () => {
        updateSnapshot();
        onStoreChange();
      };
      editor.on("selectionUpdate", update);
      editor.on("transaction", update);
      return () => {
        editor.off("selectionUpdate", update);
        editor.off("transaction", update);
      };
    },
    [editor, updateSnapshot]
  );

  const getSnapshot = useCallback((): T => snapshotRef.current.value, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const copyBlock = async (editor: Editor): Promise<void> => {
  const { from } = editor.state.selection;
  const $from = editor.state.doc.resolve(from);
  const start = $from.before($from.depth);
  const end = $from.after($from.depth);
  if (start < 0 || end <= start) {
    return;
  }
  const text = editor.state.doc.textBetween(start, end, "\n", "\n");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignored */
  }
};

export const deleteBlock = (editor: Editor): void => {
  const { from } = editor.state.selection;
  const $from = editor.state.doc.resolve(from);
  const { depth } = $from;
  const start = $from.before(depth);
  const end = $from.after(depth);
  if (start < 0 || end <= start) {
    return;
  }
  editor.chain().focus().deleteRange({ from: start, to: end }).run();
};

export const CODE_BLOCK_LANGUAGES = [
  "javascript",
  "typescript",
  "html",
  "css",
  "json",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "sql",
  "bash",
  "markdown",
  "yaml",
  "xml",
  "plaintext",
] as const;

export const CODE_BLOCK_LANGUAGE_LABELS: Record<string, string> = {
  bash: "Bash",
  c: "C",
  cpp: "C++",
  css: "CSS",
  go: "Go",
  html: "HTML",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  kotlin: "Kotlin",
  markdown: "Markdown",
  php: "PHP",
  plaintext: "Plain Text",
  python: "Python",
  ruby: "Ruby",
  rust: "Rust",
  sql: "SQL",
  swift: "Swift",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
};

export const getLanguageLabel = (lang: string): string =>
  CODE_BLOCK_LANGUAGE_LABELS[lang] ?? lang;
