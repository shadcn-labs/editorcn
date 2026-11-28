"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import type { ComponentProps } from "react";

import { cn } from "../../ui/utils";
import { withRender } from "./render";
import type { RenderProps } from "./render";

const Popover = ({
  ...props
}: ComponentProps<typeof PopoverPrimitive.Root>) => (
  <PopoverPrimitive.Root data-slot="popover" {...props} />
);

const PopoverTrigger = ({
  render,
  children,
  ...props
}: Omit<ComponentProps<typeof PopoverPrimitive.Trigger>, "asChild"> &
  RenderProps) => (
  <PopoverPrimitive.Trigger
    data-slot="popover-trigger"
    {...props}
    {...withRender({ children, render })}
  />
);

interface PopoverLabels {
  titleId: string;
  descriptionId: string;
  setTitle: (id: string | null) => void;
  setDescription: (id: string | null) => void;
}

const PopoverLabelsContext = createContext<PopoverLabels | null>(null);

const useRegisterLabel = (
  id: string | undefined,
  pick: (labels: PopoverLabels) => [string, (id: string | null) => void]
) => {
  const labels = useContext(PopoverLabelsContext);
  const [fallbackId, register] = labels ? pick(labels) : ["", undefined];
  const resolvedId = id ?? (fallbackId || undefined);
  useLayoutEffect(() => {
    if (!(register && resolvedId)) {
      return;
    }
    register(resolvedId);
    return () => register(null);
  }, [register, resolvedId]);
  return resolvedId;
};

const PopoverContent = ({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) => {
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const labels = useMemo<PopoverLabels>(
    () => ({ descriptionId, setDescription, setTitle, titleId }),
    [descriptionId, titleId]
  );
  return (
    <PopoverPrimitive.Portal>
      <PopoverLabelsContext.Provider value={labels}>
        <PopoverPrimitive.Content
          data-slot="popover-content"
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
          aria-label={ariaLabel}
          aria-labelledby={
            ariaLabelledBy ?? (ariaLabel ? undefined : (title ?? undefined))
          }
          aria-describedby={ariaDescribedBy ?? description ?? undefined}
          className={cn(
            "z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-xs text-popover-foreground shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] ring-1 ring-border/60 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          {...props}
        />
      </PopoverLabelsContext.Provider>
    </PopoverPrimitive.Portal>
  );
};

const PopoverHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="popover-header"
    className={cn("flex flex-col gap-1 text-xs", className)}
    {...props}
  />
);

const PopoverTitle = ({
  className,
  children,
  id,
  ...props
}: ComponentProps<"h2">) => {
  const resolvedId = useRegisterLabel(id, (labels) => [
    labels.titleId,
    labels.setTitle,
  ]);
  return (
    <h2
      id={resolvedId}
      data-slot="popover-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

const PopoverDescription = ({
  className,
  id,
  ...props
}: ComponentProps<"p">) => {
  const resolvedId = useRegisterLabel(id, (labels) => [
    labels.descriptionId,
    labels.setDescription,
  ]);
  return (
    <p
      id={resolvedId}
      data-slot="popover-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  );
};

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
