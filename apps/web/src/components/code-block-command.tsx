"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

import { CopyButton } from "@/components/copy-button";
import { getIconForPackageManager } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PackageManager } from "@/hooks/use-package-manager";
import { usePackageManager } from "@/hooks/use-package-manager";
import {
  REGISTRY_BASES,
  hasRegistryItemUrl,
  useRegistryBase,
  withRegistryBase,
} from "@/hooks/use-registry-base";
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
  const [registryBase, setRegistryBase] = useRegistryBase();

  const hasBaseSwitch = hasRegistryItemUrl(__npm__ ?? "");

  const commandTabs = useMemo(() => {
    const tabs = {
      bun: __bun__,
      npm: __npm__,
      pnpm: __pnpm__,
      yarn: __yarn__,
    };

    if (!hasBaseSwitch) {
      return tabs;
    }

    return Object.fromEntries(
      Object.entries(tabs).map(([key, value]) => [
        key,
        value && withRegistryBase(value, registryBase),
      ])
    ) as typeof tabs;
  }, [__npm__, __pnpm__, __yarn__, __bun__, hasBaseSwitch, registryBase]);

  const activeBase = REGISTRY_BASES.find((base) => base.value === registryBase);

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
            <span className={cn("flex", hasBaseSwitch && "max-sm:hidden")}>
              {getIconForPackageManager(packageManager)}
            </span>

            {Object.entries(commandTabs).map(([key]) => (
              <TabsTrigger
                key={key}
                className={cn(
                  "h-7 rounded-md border border-transparent px-2.5 text-xs data-[state=active]:border-border/60 data-[state=active]:bg-background data-[state=active]:shadow-none dark:data-[state=active]:border-border/60 dark:data-[state=active]:bg-background",
                  hasBaseSwitch && "max-sm:px-2"
                )}
                sound="tabSwitch"
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
          {hasBaseSwitch && (
            <DropdownMenu sounds>
              <DropdownMenuTrigger asChild>
                <Button
                  className="ml-auto h-7 shrink-0 gap-1 rounded-md px-1.5 text-xs has-[>svg]:px-1.5 font-medium text-muted-foreground hover:text-foreground"
                  size="sm"
                  variant="ghost"
                >
                  <span className="sm:hidden">{activeBase?.short}</span>
                  <span className="max-sm:hidden">{activeBase?.label}</span>
                  <ChevronDownIcon aria-hidden className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-32"
                collisionPadding={8}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {REGISTRY_BASES.map((base) => (
                  <DropdownMenuItem
                    key={base.value}
                    onSelect={() => setRegistryBase(base.value)}
                    sound="click"
                  >
                    {base.label}
                    {base.value === registryBase ? (
                      <CheckIcon aria-hidden className="ml-auto" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                  {value?.split("\n").map((line, index) => (
                    <span key={index} className="block">
                      <span className="select-none">$ </span>
                      {line}
                    </span>
                  ))}
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
