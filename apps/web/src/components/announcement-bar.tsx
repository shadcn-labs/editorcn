import { ArrowRightIcon, SparklesIcon } from "lucide-react";

import { LINK } from "@/constants/links";

export const AnnouncementBar = () => (
  <a
    className="group flex h-9 items-center justify-center gap-2 border-b border-border/60 bg-muted/50 px-4 text-sm font-medium text-foreground outline-none transition-colors duration-150 ease-out hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none"
    href={LINK.PRO}
    rel="noopener"
    target="_blank"
  >
    <SparklesIcon aria-hidden className="size-3.5 shrink-0" />
    <span className="truncate">
      <span className="sm:hidden">editorcn pro is live</span>
      <span className="hidden sm:inline">
        editorcn pro is live: ready-made editor templates for your app
      </span>
    </span>
    <ArrowRightIcon
      aria-hidden
      className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
    />
  </a>
);
