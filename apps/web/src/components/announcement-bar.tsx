import { ArrowRightIcon } from "lucide-react";

import { LINK } from "@/constants/links";

export const AnnouncementBar = () => (
  <a
    className="group flex min-h-11 items-center justify-center gap-3 bg-primary px-4 py-1.5 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
    href={LINK.PRO}
    rel="noopener"
    target="_blank"
  >
    <span className="min-w-0 truncate">
      <span className="font-semibold">editorcn pro is live</span>
      <span className="hidden text-primary-foreground/70 md:inline">
        : ready-made editor apps, one payment, lifetime updates
      </span>
    </span>
    <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-background px-3 text-xs font-medium text-foreground transition-colors duration-150 ease-out group-hover:bg-background/90 motion-reduce:transition-none">
      Get it
      <ArrowRightIcon
        aria-hidden
        className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </span>
  </a>
);
