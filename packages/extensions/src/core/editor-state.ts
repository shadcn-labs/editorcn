import type { Editor } from "@tiptap/core";
import { useCallback, useRef, useSyncExternalStore } from "react";

const defaultEqual = <T>(a: T, b: T): boolean => a === b;

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

const isPlainEmpty = <T>(value: T | undefined): value is undefined =>
  value === undefined;

export const useEditorState = <T>(
  editor: Editor | null,
  selector: (e: Editor) => T,
  isEqual: (a: T, b: T) => boolean = defaultEqual
): T | undefined => {
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);
  selectorRef.current = selector;
  isEqualRef.current = isEqual;

  const snapshotRef = useRef<{ value: T | undefined }>({
    value: editor ? selector(editor) : undefined,
  });

  const computeSnapshot = useCallback((): T | undefined => {
    if (!editor) {
      return undefined;
    }
    const next = selectorRef.current(editor);
    const current = snapshotRef.current.value;
    if (isPlainEmpty(current) || !isEqualRef.current(current, next)) {
      snapshotRef.current.value = next;
    }
    return snapshotRef.current.value;
  }, [editor]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!editor) {
        return () => {
          /* Nothing to subscribe to. */
        };
      }
      const update = () => {
        computeSnapshot();
        onStoreChange();
      };
      editor.on("selectionUpdate", update);
      editor.on("transaction", update);
      return () => {
        editor.off("selectionUpdate", update);
        editor.off("transaction", update);
      };
    },
    [editor, computeSnapshot]
  );

  return useSyncExternalStore(subscribe, computeSnapshot, computeSnapshot);
};
