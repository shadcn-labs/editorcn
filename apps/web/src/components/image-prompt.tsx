"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

let resolveCurrent: ((url: string | null) => void) | null = null;
let listeners: (() => void)[] = [];
let isOpen = false;

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = () => isOpen;

const notifyListeners = () => {
  for (const listener of listeners) {
    listener();
  }
};

const open = () => {
  isOpen = true;
  notifyListeners();
};

const close = () => {
  isOpen = false;
  notifyListeners();
};

export const showImagePrompt = (): Promise<string | null> => {
  if (isOpen) {
    return Promise.resolve(null);
  }
  open();
  const { promise, resolve } = Promise.withResolvers<string | null>();
  resolveCurrent = resolve;
  return promise;
};

export const ImagePromptPortal = () => {
  const shown = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shown) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [shown]);

  const handleClose = useCallback((val: string | null) => {
    close();
    setUrl("");
    resolveCurrent?.(val);
    resolveCurrent = null;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      handleClose(typeof reader.result === "string" ? reader.result : null);
    });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = url.trim();
    if (!val) {
      return;
    }
    let finalUrl = val;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    handleClose(finalUrl);
  };

  return (
    <Dialog
      open={shown}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Paste an image URL or pick a file from your device.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose a file...
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleClose(null)}
            >
              Cancel
            </Button>
            <Button type="submit">Insert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
