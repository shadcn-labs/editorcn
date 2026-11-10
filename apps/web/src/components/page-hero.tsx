import type { ReactNode } from "react";

import { Announcement } from "@/components/announcement";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  description: ReactNode;
  descriptionClassName?: string;
  showAnnouncement?: boolean;
  title: ReactNode;
  titleClassName?: string;
}

export const PageHero = ({
  description,
  descriptionClassName,
  showAnnouncement = false,
  title,
  titleClassName,
}: PageHeroProps) => (
  <header className="flex flex-col items-center gap-4 text-center">
    {showAnnouncement && (
      <div className="mb-2">
        <Announcement />
      </div>
    )}
    <h1
      className={cn(
        "text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl",
        titleClassName
      )}
    >
      {title}
    </h1>
    <p
      className={cn(
        "text-muted-foreground max-w-lg text-base leading-relaxed text-balance",
        descriptionClassName
      )}
    >
      {description}
    </p>
  </header>
);
