"use client";

import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { Editor } from "@tiptap/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";

import { cn } from "../ui/utils";
import { defaultFloatingMenuItems } from "./default-items";
import type { FloatingMenuOptions } from "./extension";
import { getFloatingMenuState } from "./extension";

export interface FloatingMenuItem {
  icon: React.ReactNode;
  label: string;
  command: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
}

export interface FloatingMenuProps {
  editor: Editor | null;
  items?: FloatingMenuItem[];
  shouldShow?: (props: { editor: Editor }) => boolean;
  className?: string;
  itemClassName?: string;
  offset?: number;
}

const defaultShouldShow = ({ editor }: { editor: Editor }) => {
  if (
    !editor.isEditable ||
    !editor.isFocused ||
    !editor.state.selection.empty
  ) {
    return false;
  }
  // Empty textblock only: typing hides the menu.
  const { $from } = editor.state.selection;
  return $from.parent.isTextblock && $from.parent.textContent === "";
};

const getExtensionShouldShow = (
  editor: Editor
): FloatingMenuOptions["shouldShow"] => {
  const extension = editor.extensionManager.extensions.find(
    (e) => e.name === "floatingMenu"
  );
  const options = extension?.options as FloatingMenuOptions | undefined;
  return typeof options?.shouldShow === "function"
    ? options.shouldShow
    : undefined;
};

export const FloatingMenu = ({
  editor,
  items,
  shouldShow,
  className,
  itemClassName,
  offset: menuOffset = 8,
}: FloatingMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  // Re-render on every editor change so visibility and item
  // active-states always reflect live editor state.
  const [tick, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Block actions by default; pass `items` to customize.
  const resolvedItems = items ?? defaultFloatingMenuItems;

  const effectiveShouldShow =
    shouldShow ??
    (editor ? getExtensionShouldShow(editor) : undefined) ??
    defaultShouldShow;

  useEffect(() => {
    if (!editor) {
      return;
    }
    const bump = () => forceUpdate();
    editor.on("transaction", bump);
    editor.on("selectionUpdate", bump);
    editor.on("focus", bump);
    editor.on("blur", bump);
    return () => {
      editor.off("transaction", bump);
      editor.off("selectionUpdate", bump);
      editor.off("focus", bump);
      editor.off("blur", bump);
    };
  }, [editor]);

  const show =
    editor !== null &&
    resolvedItems.length > 0 &&
    editor.isEditable &&
    editor.isFocused &&
    effectiveShouldShow({ editor });

  const updateMenuPosition = useCallback(async () => {
    if (!editor || !menuRef.current) {
      return;
    }
    // Fall back to the live selection when the extension isn't installed.
    const pos =
      getFloatingMenuState(editor)?.pos ?? editor.state.selection.from;
    if (pos < 0) {
      return;
    }

    let coords: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    } | null = null;
    try {
      coords = editor.view.coordsAtPos(pos);
    } catch {
      try {
        const dom = editor.view.domAtPos(pos);
        const raw: unknown = dom.node;
        const el = raw instanceof HTMLElement ? raw : null;
        if (el) {
          const rect = el.getBoundingClientRect();
          coords = {
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            top: rect.top,
          };
        }
      } catch {
        coords = null;
      }
    }

    if (!coords || !menuRef.current) {
      return;
    }

    const rect = {
      bottom: coords.bottom,
      height: Math.max(coords.bottom - coords.top, 0),
      left: coords.left,
      right: coords.right,
      top: coords.top,
      width: Math.max(coords.right - coords.left, 0),
      x: coords.left,
      y: coords.top,
    };
    const virtualElement = { getBoundingClientRect: () => rect };

    const place = (x: number, y: number) => {
      const el = menuRef.current;
      if (!el) {
        return;
      }
      // Vertically center the menu on the cursor line instead of
      // top-aligning it, then clamp into the viewport.
      const menuHeight = el.offsetHeight || 0;
      const lineHeight = Math.max(rect.height, 0);
      const centeredY = y - Math.max(menuHeight - lineHeight, 0) / 2;
      const margin = 4;
      const maxY = Math.max(window.innerHeight - menuHeight - margin, margin);
      el.style.left = `${x}px`;
      el.style.top = `${Math.min(Math.max(centeredY, margin), maxY)}px`;
    };

    try {
      const { x, y } = await computePosition(virtualElement, menuRef.current, {
        middleware: [offset(menuOffset), flip(), shift()],
        // Same line as the cursor, right after the caret.
        placement: "right-start",
      });
      place(x, y);
    } catch {
      place(rect.right + menuOffset, rect.top);
    }
  }, [editor, menuOffset]);

  useLayoutEffect(() => {
    if (!show || !editor) {
      return;
    }
    updateMenuPosition();
  }, [show, tick, editor, updateMenuPosition]);

  useEffect(() => {
    if (!show || !editor) {
      return;
    }
    const handle = () => updateMenuPosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [show, editor, updateMenuPosition]);

  if (!show || !editor) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={cn("rte-floating-menu", className)}
      style={{
        left: 0,
        position: "fixed",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="rte-floating-group">
        {resolvedItems.map((item, i) => {
          const isActive = item.isActive ? item.isActive(editor) : false;
          return (
            <button
              key={i}
              type="button"
              className={cn(
                "rte-floating-item",
                isActive && "rte-floating-item--active",
                itemClassName
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                item.command(editor);
              }}
              aria-label={item.label}
              title={item.label}
              data-active={isActive}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
