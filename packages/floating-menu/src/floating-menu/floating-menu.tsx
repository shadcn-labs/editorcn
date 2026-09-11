"use client";

import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { Editor } from "@tiptap/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { cn } from "../lib/utils";
import { defaultFloatingMenuItems } from "./default-items";
import { defaultFloatingMenuShouldShow } from "./extension";
import type { FloatingMenuOptions } from "./extension";

export interface FloatingMenuItem {
  icon: React.ReactNode;
  label: string;
  command: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  /** Stable key for the button; falls back to `label`. */
  id?: string;
}

export interface FloatingMenuProps {
  editor: Editor | null;
  items?: FloatingMenuItem[];
  shouldShow?: (props: { editor: Editor }) => boolean;
  className?: string;
  itemClassName?: string;
  offset?: number;
}

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
  // Hidden until first positioned so the initial frame never
  // flashes at the viewport origin. Resets on unmount (hide).
  const [positioned, setPositioned] = useState(false);

  // Block actions by default; pass `items` to customize.
  const resolvedItems = items ?? defaultFloatingMenuItems;

  const effectiveShouldShow =
    shouldShow ??
    (editor ? getExtensionShouldShow(editor) : undefined) ??
    defaultFloatingMenuShouldShow;

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
    effectiveShouldShow({ editor });

  const updateMenuPosition = useCallback(async () => {
    if (!editor || !menuRef.current) {
      return;
    }
    // The cursor position is read live; the extension is an options
    // bag and install marker, not position storage.
    const pos = editor.state.selection.from;

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
        let el: HTMLElement | null = null;
        if (raw instanceof HTMLElement) {
          el = raw;
        } else if (raw instanceof Text) {
          el = raw.parentElement;
        }
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
      if (menuRef.current) {
        menuRef.current.style.left = `${x}px`;
        menuRef.current.style.top = `${y}px`;
        setPositioned(true);
      }
    };

    try {
      const { x, y } = await computePosition(virtualElement, menuRef.current, {
        middleware: [offset(menuOffset), flip(), shift({ crossAxis: true })],
        // Same line as the cursor, right after the caret, vertically
        // centered; shift keeps the centered menu in view.
        placement: "right",
      });
      place(x, y);
    } catch {
      place(
        rect.right + menuOffset,
        rect.top -
          Math.max((menuRef.current?.offsetHeight || 0) - rect.height, 0) / 2
      );
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
      className={cn("fm-menu", className)}
      style={{
        left: 0,
        position: "fixed",
        top: 0,
        visibility: positioned ? "visible" : "hidden",
        zIndex: 50,
      }}
    >
      <div className="fm-group">
        {resolvedItems.map((item) => {
          const isActive = item.isActive ? item.isActive(editor) : false;
          return (
            <button
              key={item.id ?? item.label}
              type="button"
              className={cn(
                "fm-item",
                isActive && "fm-item--active",
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
