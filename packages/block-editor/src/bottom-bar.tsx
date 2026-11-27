import type { Editor } from "@tiptap/react";
import { useEffect, useRef } from "react";

import { TextAlignSelector } from "./bubble-menu/align-selector";
import { ColorSelector } from "./bubble-menu/color-selector";
import { LinkSelector } from "./bubble-menu/link-selector";
import { NodeSelector } from "./bubble-menu/node-selector";
import { TextButtons } from "./bubble-menu/text-buttons";
import { IconPlaceholder } from "./icon-placeholder";
import { BubbleButton, BubbleSeparator } from "./ui";

export interface BottomBarProps {
  editor: Editor;
}

export const BottomBar = ({ editor }: BottomBarProps) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const bar = barRef.current;
    if (!viewport || !bar) {
      return;
    }
    const update = () => {
      const inset = window.innerHeight - viewport.height - viewport.offsetTop;
      bar.style.setProperty(
        "--block-editor-keyboard-inset",
        `${Math.max(0, inset)}px`
      );
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  const handleAdd = () => {
    const { $from } = editor.state.selection;
    const chain = editor.chain().focus();
    if ($from.depth > 0 && $from.parent.textContent) {
      const pos = $from.after();
      chain
        .insertContentAt(pos, { type: "paragraph" })
        .setTextSelection(pos + 1);
    }
    chain.insertContent("/").run();
  };

  const hasTextAlign = editor.extensionManager.extensions.some(
    (ext) => ext.name === "textAlign"
  );

  return (
    <div
      ref={barRef}
      className="block-editor-bottom-bar sticky bottom-(--block-editor-keyboard-inset,0px) z-20 hidden border-t border-border bg-background [timeline-scope:--block-editor-bottom-bar] before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-0 before:z-1 before:w-6 before:bg-[linear-gradient(to_right,var(--background),transparent)] before:opacity-0 before:content-[''] after:pointer-events-none after:absolute after:top-0 after:right-0 after:bottom-0 after:z-1 after:w-6 after:bg-[linear-gradient(to_left,var(--background),transparent)] after:content-[''] supports-[animation-timeline:scroll()]:before:animate-block-editor-fade-in supports-[animation-timeline:scroll()]:before:[animation-range:0_2rem] supports-[animation-timeline:scroll()]:before:[animation-timeline:--block-editor-bottom-bar] supports-[animation-timeline:scroll()]:after:opacity-0 supports-[animation-timeline:scroll()]:after:animate-block-editor-fade-out supports-[animation-timeline:scroll()]:after:[animation-range:calc(100%-2rem)_100%] supports-[animation-timeline:scroll()]:after:[animation-timeline:--block-editor-bottom-bar] [@media(hover:none)_and_(pointer:coarse)]:block [&_.block-editor-bubble-dropdown]:top-auto [&_.block-editor-bubble-dropdown]:bottom-full [&_.block-editor-bubble-dropdown]:left-2 [&_.block-editor-bubble-dropdown]:m-0 [&_.block-editor-bubble-dropdown]:mb-1 [&_.block-editor-bubble-dropdown]:max-h-[50vh] [&_.block-editor-bubble-dropdown]:origin-bottom-left [&_.block-editor-bubble-dropdown]:overflow-y-auto"
    >
      <div className="block-editor-bottom-bar-scroll flex h-12 items-center gap-1 overflow-x-auto [scroll-timeline:--block-editor-bottom-bar_x] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>div]:static!">
        <BubbleButton
          aria-label="Add block"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAdd}
        >
          <IconPlaceholder
            lucide="Plus"
            tabler="IconPlus"
            hugeicons="PlusSignIcon"
            phosphor="PlusIcon"
            remixicon="RiAddLine"
          />
        </BubbleButton>
        <NodeSelector editor={editor} />
        <BubbleSeparator />
        <TextButtons editor={editor} />
        <BubbleSeparator />
        <ColorSelector editor={editor} />
        <LinkSelector editor={editor} />
        {hasTextAlign && (
          <>
            <BubbleSeparator />
            <TextAlignSelector editor={editor} />
          </>
        )}
      </div>
    </div>
  );
};
