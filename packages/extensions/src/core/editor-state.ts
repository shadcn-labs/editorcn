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

export const useEditorState = <T>(
  editor: Editor | null,
  selector: (e: Editor) => T,
  isEqual: (a: T, b: T) => boolean = defaultEqual
): T | undefined => {
  // getSnapshot must keep returning the same value until the selection
  // actually changes, or useSyncExternalStore re-renders forever. The cache
  // is only read and written inside getSnapshot, never in the render body,
  // and getSnapshot always uses the current selector (no stale "latest ref").
  const cacheRef = useRef<{ value: T } | null>(null);

  const getSnapshot = useCallback((): T | undefined => {
    if (!editor) {
      return undefined;
    }
    const next = selector(editor);
    const { current: cached } = cacheRef;
    if (cached && isEqual(cached.value, next)) {
      return cached.value;
    }
    cacheRef.current = { value: next };
    return next;
  }, [editor, selector, isEqual]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!editor) {
        return () => {
          /* Nothing to subscribe to. */
        };
      }
      editor.on("selectionUpdate", onStoreChange);
      editor.on("transaction", onStoreChange);
      return () => {
        editor.off("selectionUpdate", onStoreChange);
        editor.off("transaction", onStoreChange);
      };
    },
    [editor]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const useEditable = (editor: Editor | null): boolean => {
  const [editable, setEditable] = useState(() =>
    Boolean(editor && !editor.isDestroyed && editor.isEditable)
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
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

  // No live editor means not editable; derive it instead of syncing state.
  return Boolean(editor && !editor.isDestroyed) && editable;
};
