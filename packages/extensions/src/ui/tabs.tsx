import * as React from "react";
import { useContext, useState } from "react";

import { cn } from "./utils";

interface TabsState {
  setValue: (value: string) => void;
  value: string;
}

const TabsContext = React.createContext<TabsState | null>(null);

export interface TabsProps {
  children: React.ReactNode;
  className?: string;
  defaultValue: string;
}

const Tabs = ({ children, className, defaultValue }: TabsProps) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={cn("ext-tabs flex flex-col", className)}>
      <TabsContext.Provider value={{ setValue, value }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
};

const useTabs = (): TabsState => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger and TabsContent must be used inside Tabs");
  }
  return context;
};

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "ext-tabs-list flex w-fit gap-0.5 rounded-sm bg-muted p-1",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, onClick, value, ...props }, ref) => {
    const { setValue, value: current } = useTabs();
    const isActive = current === value;
    const cls = cn(
      "ext-tabs-trigger inline-flex cursor-pointer items-center gap-1.5 rounded-[calc(var(--radius)-6px)] border-none bg-transparent px-2.5 py-1 text-[0.8125rem] whitespace-nowrap text-muted-foreground [transition:background-color_150ms_ease-out,color_150ms_ease-out] hover:text-foreground hover:outline-none focus-visible:text-foreground focus-visible:outline-none [&>svg]:size-4 [&>svg]:shrink-0",
      isActive &&
        "ext-tabs-trigger--active bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
      className
    );

    return (
      <button
        ref={ref}
        aria-selected={isActive}
        className={cls}
        role="tab"
        type="button"
        onClick={(event) => {
          setValue(value);
          onClick?.(event);
        }}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: current } = useTabs();
    if (current !== value) {
      return null;
    }
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn("ext-tabs-content pt-2", className)}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
