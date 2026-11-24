import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorToolbarProps } from "./types";
import { cn } from "./ui/utils";

export const Toolbar = ({
  children,
  className,
  sticky,
  stickyOffset = 0,
}: RichTextEditorToolbarProps) => {
  const { variant, editable } = useRichTextEditorContext();

  if (!editable) {
    return null;
  }

  return (
    <div
      className={cn(
        "rte-toolbar top-[var(--rte-sticky-offset,0px)] z-1 flex flex-wrap items-center justify-center gap-1 rounded-ss-[calc(var(--radius)+3px)] rounded-se-[calc(var(--radius)+3px)] border-b border-(--rte-hairline) bg-(--rte-strip) px-2 py-1.5 [transition:background-color_150ms_ease-out]",
        "[@media(max-width:640px)]:justify-start [@media(max-width:640px)]:flex-nowrap [@media(max-width:640px)]:overflow-x-auto [@media(max-width:640px)]:[--rte-toolbar-fade-end:1.5rem] [@media(max-width:640px)]:[-ms-overflow-style:none] [@media(max-width:640px)]:[-webkit-overflow-scrolling:touch] [@media(max-width:640px)]:[mask-image:linear-gradient(to_right,transparent,black_var(--rte-toolbar-fade-start),black_calc(100%-var(--rte-toolbar-fade-end)),transparent)] [@media(max-width:640px)]:[scrollbar-width:none] [@media(max-width:640px)]:[&::-webkit-scrollbar]:hidden [@media(max-width:640px)]:supports-[animation-timeline:scroll()]:[--rte-toolbar-fade-end:0px] [@media(max-width:640px)]:supports-[animation-timeline:scroll()]:animate-rte-toolbar-fade [@media(max-width:640px)]:supports-[animation-timeline:scroll()]:[animation-timeline:scroll(self_inline)]",
        variant !== "default" && `rte-toolbar--${variant}`,
        variant === "default" &&
          "gap-1 rounded-none border-b-0 bg-transparent px-0 pt-0 pb-1",
        variant === "subtle" && "gap-1 px-1.5 py-1",
        variant === "compact" &&
          "gap-0.5 rounded-none px-1.5 py-1 first:rounded-ss-[calc(var(--radius)-1px)] first:rounded-se-[calc(var(--radius)-1px)]",
        sticky &&
          "sticky bg-[color-mix(in_srgb,var(--rte-strip)_80%,transparent)] backdrop-blur-lg",
        sticky &&
          variant === "default" &&
          "-mx-1 -mt-1 rounded-ss-[calc(var(--radius)+3px)] rounded-se-[calc(var(--radius)+3px)] bg-[color-mix(in_srgb,var(--rte-strip)_85%,transparent)] p-1",
        className
      )}
      data-sticky={sticky ? "" : undefined}
      style={sticky ? { top: stickyOffset } : undefined}
    >
      {children}
    </div>
  );
};
