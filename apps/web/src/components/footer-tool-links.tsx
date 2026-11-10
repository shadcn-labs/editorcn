import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { TOOLS } from "@/lib/tools";

// Server component, passed into the client SiteFooter so the full tool data
// stays out of the client bundle.
export const FooterToolLinks = () => (
  <nav
    aria-label="Free tools"
    className="flex flex-wrap items-center justify-center gap-1 pt-6 pb-1"
  >
    <Link
      className="px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      href={ROUTES.TOOLS}
      prefetch={false}
    >
      Free tools
    </Link>
    {TOOLS.map((tool) => (
      <Link
        className="inline-flex h-7 items-center rounded-md px-2.5 text-xs text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none sm:text-sm"
        href={`${ROUTES.TOOLS}/${tool.slug}`}
        key={tool.slug}
        prefetch={false}
      >
        {tool.title.replace(/ Converter$/, "")}
      </Link>
    ))}
  </nav>
);
