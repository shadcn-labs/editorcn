import type { Editor } from "@tiptap/core";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

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

export const useEditable = (editor: Editor | null): boolean => {
  const [editable, setEditable] = useState(() =>
    Boolean(editor && !editor.isDestroyed && editor.isEditable)
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      setEditable(false);
      return;
    }
    const sync = () => setEditable(!editor.isDestroyed && editor.isEditable);
    sync();
    const observer = new MutationObserver(sync);
    const attach = () => {
      sync();
      observer.observe(editor.view.dom, {
        attributeFilter: ["contenteditable"],
        attributes: true,
      });
    };
    if (editor.isInitialized) {
      attach();
    } else {
      editor.on("create", attach);
    }
    editor.on("update", sync);
    return () => {
      observer.disconnect();
      editor.off("create", attach);
      editor.off("update", sync);
    };
  }, [editor]);

  return editable;
};
