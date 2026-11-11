import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

export const Announcement = () => (
  <Link
    href="/docs/templates"
    prefetch={false}
    className="group inline-flex h-8 items-center gap-2 rounded-full border border-border/60 bg-background pr-1 pl-3 text-sm font-medium whitespace-nowrap text-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
  >
    <SparklesIcon aria-hidden className="size-3.5" />
    Introducing Templates
    <span aria-hidden className="h-4 w-px bg-border" />
    <span
      aria-hidden
      className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
    >
      <ArrowRightIcon className="size-3.5" />
    </span>
  </Link>
);
