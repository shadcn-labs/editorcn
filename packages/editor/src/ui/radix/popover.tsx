"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "../utils";
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

const PopoverContent = ({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-none bg-popover p-2.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);

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
  ...props
}: ComponentProps<"h2">) => (
  <h2
    data-slot="popover-title"
    className={cn("text-sm font-medium", className)}
    {...props}
  >
    {children}
  </h2>
);

const PopoverDescription = ({ className, ...props }: ComponentProps<"p">) => (
  <p
    data-slot="popover-description"
    className={cn("text-xs/relaxed text-muted-foreground", className)}
    {...props}
  />
);

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
