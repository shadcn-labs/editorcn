"use client";

import { useCallback, useMemo } from "react";

import { CopyButton } from "@/components/copy-button";
import { getIconForPackageManager } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PackageManager } from "@/hooks/use-package-manager";
import { usePackageManager } from "@/hooks/use-package-manager";
import type { Event } from "@/lib/events";
import { cn } from "@/lib/utils";

export const CodeBlockCommand = ({
  __npm__,
  __yarn__,
  __pnpm__,
  __bun__,
  className,
  copyEvent = "copy_npm_command",
}: {
  __npm__?: string;
  __yarn__?: string;
  __pnpm__?: string;
  __bun__?: string;
  className?: string;
  copyEvent?: Event["name"];
}) => {
  const [packageManager, setPackageManager] = usePackageManager();

  const commandTabs = useMemo(
    () => ({
      bun: __bun__,
      npm: __npm__,
      pnpm: __pnpm__,
      yarn: __yarn__,
    }),
    [__npm__, __pnpm__, __yarn__, __bun__]
  );

  const handlePackageManagerChange = useCallback(
    (value: string) => setPackageManager(value as PackageManager),
    [setPackageManager]
  );

  const copyValue = useMemo(
    () => commandTabs[packageManager] || "",
    [commandTabs, packageManager]
  );

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-muted/50 p-1 text-sm",
        className
      )}
    >
      <Tabs
        className="gap-0"
        onValueChange={handlePackageManagerChange}
        value={packageManager}
      >
        <div className="flex h-9 items-center gap-2 pr-10 pl-2">
          <TabsList className="gap-0.5 rounded-none bg-transparent p-0 [&_svg]:me-2 [&_svg]:size-4 [&_svg]:text-muted-foreground">
            {getIconForPackageManager(packageManager)}

            {Object.entries(commandTabs).map(([key]) => (
              <TabsTrigger
                key={key}
                className="h-7 rounded-md border border-transparent px-2.5 text-xs data-[state=active]:border-border/60 data-[state=active]:bg-background data-[state=active]:shadow-none dark:data-[state=active]:border-border/60 dark:data-[state=active]:bg-background"
                sound="tabSwitch"
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="no-scrollbar overflow-x-auto rounded-lg border border-border/60 bg-card text-card-foreground">
          {Object.entries(commandTabs).map(([key, value]) => (
            <TabsContent key={key} className="mt-0 px-4 py-3.5" value={key}>
              <pre>
                <code
                  data-slot="code-block"
                  data-language="bash"
                  className="font-mono text-sm/none"
                >
                  <span className="select-none">$ </span>
                  {value}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      <CopyButton
        className="absolute top-2 right-2 z-10 size-7 rounded-md opacity-70 hover:opacity-100 focus-visible:opacity-100"
        value={copyValue}
        event={copyEvent}
      />
    </div>
  );
};
