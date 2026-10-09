import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export const Announcement = () => (
  <Link
    href="/docs/templates"
    prefetch={false}
    className="group inline-flex items-center gap-2 rounded-full border bg-muted/60 py-1 pr-3 pl-1 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted"
  >
    <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
      New
    </span>
    Introducing
    <span className="font-semibold text-foreground">Templates</span>
    <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
  </Link>
);
