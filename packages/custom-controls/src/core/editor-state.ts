import type { Editor } from "@tiptap/core";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

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

export const useEditorState = <T>(
  editor: Editor | null,
  selector: (e: Editor) => T,
  isEqual: (a: T, b: T) => boolean = defaultEqual
): T | undefined => {
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);

  useEffect(() => {
    selectorRef.current = selector;
    isEqualRef.current = isEqual;
  });

  const snapshotRef = useRef<{ value: T | undefined }>({
    value: editor ? selector(editor) : undefined,
  });

  const updateSnapshot = useCallback(() => {
    if (!editor) {
      return;
    }
    const next = selectorRef.current(editor);
    const current = snapshotRef.current.value;
    if (current !== undefined && isEqualRef.current(current, next)) {
      return;
    }
    snapshotRef.current = { value: next };
  }, [editor]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!editor) {
        return () => {};
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

  const getSnapshot = useCallback(
    (): T | undefined => snapshotRef.current.value,
    []
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
