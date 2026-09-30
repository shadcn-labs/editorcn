import * as React from "react";
import { useContext, useState } from "react";

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

const Tabs = ({ children, className = "", defaultValue }: TabsProps) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={`ext-tabs ${className}`.trim()}>
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
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={`ext-tabs-list ${className}`.trim()}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className = "", onClick, value, ...props }, ref) => {
    const { setValue, value: current } = useTabs();
    const isActive = current === value;
    const cls = [
      "ext-tabs-trigger",
      isActive ? "ext-tabs-trigger--active" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

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
  ({ className = "", value, ...props }, ref) => {
    const { value: current } = useTabs();
    if (current !== value) {
      return null;
    }
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={`ext-tabs-content ${className}`.trim()}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
