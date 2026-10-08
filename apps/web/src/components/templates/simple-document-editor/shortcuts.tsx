"use client";

import { Keyboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { SCROLLBAR, SHORTCUTS } from "./constants";

export const ShortcutsPopover = () => {
  const mod = /Mac|iPhone|iPad/.test(globalThis.navigator?.userAgent ?? "")
    ? "⌘"
    : "Ctrl";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="text-muted-foreground h-6 gap-1.5 px-2 text-xs"
          size="sm"
          variant="ghost"
        >
          <Keyboard className="size-3.5" />
          Shortcuts
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn("max-h-80 w-72 overflow-y-auto p-3", SCROLLBAR)}
        side="top"
      >
        <p className="mb-2 text-sm font-medium">Keyboard shortcuts</p>
        {SHORTCUTS.map((section) => (
          <div key={section.title} className="mb-3 last:mb-0">
            <p className="text-muted-foreground mb-1 text-xs">
              {section.title}
            </p>
            {section.items.map(([label, keys]) => (
              <div
                key={label}
                className="flex items-center justify-between py-1 text-sm"
              >
                {label}
                <KbdGroup>
                  {keys.split("+").map((key) => (
                    <Kbd key={key}>{key === "Mod" ? mod : key}</Kbd>
                  ))}
                </KbdGroup>
              </div>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
