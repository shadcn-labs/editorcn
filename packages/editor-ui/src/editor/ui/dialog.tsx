"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/cn";
import { usePresence } from "../../lib/use-presence";
import { Button } from "./button";
import { composeRefs, renderPrimitive } from "./render";
import type { RenderElement } from "./render";

const EXIT_DURATION = 100;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusable = (container: HTMLElement | null): HTMLElement[] => {
  if (!container) {
    return [];
  }
  return [
    ...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ].filter(
    (node) =>
      !node.hasAttribute("disabled") &&
      node.getAttribute("aria-hidden") !== "true"
  );
};

interface DialogContextValue {
  contentRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

const useDialogContext = (component: string): DialogContextValue => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error(`${component} must be used inside a Dialog`);
  }
  return context;
};

export interface DialogProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

const Dialog = ({
  children,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen,
}: DialogProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const content = contentRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const [first] = getFocusable(content);
      (first ?? content)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable(content);
      if (focusable.length === 0) {
        event.preventDefault();
        content?.focus();
        return;
      }

      const [first] = focusable;
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        content?.focus();
        return;
      }

      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === content)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (content?.contains(target) || triggerRef.current?.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previouslyFocused?.focus?.();
    };
  }, [open, setOpen]);

  const value = React.useMemo(
    () => ({ contentRef, open, setOpen, triggerRef }),
    [open, setOpen]
  );

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
};
Dialog.displayName = "Dialog";

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderElement;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, render, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDialogContext("DialogTrigger");

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setOpen(!open);
    };

    return renderPrimitive({
      fallbackType: "button",
      ownProps: {
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        "data-slot": "dialog-trigger",
        "data-state": open ? "open" : "closed",
        onClick: handleClick,
        type: "button",
        ...props,
      },
      ownRef: composeRefs(triggerRef, ref) as React.Ref<HTMLElement>,
      render,
    });
  }
);
DialogTrigger.displayName = "DialogTrigger";

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderElement;
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, render, ...props }, ref) => {
    const { setOpen } = useDialogContext("DialogClose");

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setOpen(false);
    };

    return renderPrimitive({
      fallbackType: "button",
      ownProps: {
        "data-slot": "dialog-close",
        onClick: handleClick,
        type: "button",
        ...props,
      },
      ownRef: ref as React.Ref<HTMLElement>,
      render,
    });
  }
);
DialogClose.displayName = "DialogClose";

export interface DialogPortalProps {
  children?: React.ReactNode;
}

const DialogPortal = ({ children }: DialogPortalProps) => <>{children}</>;
DialogPortal.displayName = "DialogPortal";

export type DialogOverlayProps = React.HTMLAttributes<HTMLDivElement>;

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-overlay"
      className={cn("rte-dialog-overlay", className)}
      {...props}
    />
  )
);
DialogOverlay.displayName = "DialogOverlay";

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  render?: RenderElement;
  showCloseButton?: boolean;
}

const DialogCloseIcon = () => (
  <>
    {"X"}
    <span className="rte-sr-only">Close</span>
  </>
);

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, render, showCloseButton = true, ...props }, ref) => {
    const { contentRef, open } = useDialogContext("DialogContent");
    const mounted = usePresence(open, EXIT_DURATION);
    const state = open ? "open" : "closed";

    if (!mounted || typeof document === "undefined") {
      return null;
    }

    return createPortal(
      <>
        <DialogOverlay data-state={state} />
        {renderPrimitive({
          fallbackType: "div",
          ownProps: {
            "aria-modal": true,
            children: (
              <>
                {children}
                {showCloseButton && (
                  <DialogClose
                    className="rte-dialog-content-close"
                    render={<Button size="icon-sm" variant="ghost" />}
                  >
                    <DialogCloseIcon />
                  </DialogClose>
                )}
              </>
            ),
            className: cn("rte-dialog-content", className),
            "data-slot": "dialog-content",
            "data-state": state,
            role: "dialog",
            tabIndex: -1,
            ...props,
          },
          ownRef: composeRefs(contentRef, ref) as React.Ref<HTMLElement>,
          precedence: "own",
          render,
        })}
      </>,
      document.body
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="dialog-header"
    className={cn("rte-dialog-header", className)}
    {...props}
  />
);

export interface DialogFooterProps extends React.ComponentProps<"div"> {
  showCloseButton?: boolean;
}

const DialogFooter = ({
  children,
  className,
  showCloseButton = false,
  ...props
}: DialogFooterProps) => (
  <div
    data-slot="dialog-footer"
    className={cn("rte-dialog-footer", className)}
    {...props}
  >
    {children}
    {showCloseButton && (
      <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
    )}
  </div>
);

const DialogTitle = ({ className, ...props }: React.ComponentProps<"h2">) => (
  <h2
    data-slot="dialog-title"
    className={cn("rte-dialog-title", className)}
    {...props}
  />
);

const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => (
  <p
    data-slot="dialog-description"
    className={cn("rte-dialog-description", className)}
    {...props}
  />
);

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
