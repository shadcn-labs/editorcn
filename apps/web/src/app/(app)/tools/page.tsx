import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { PageTransition } from "@/components/page-transition";
import { ToolFormatLabel, ToolIcon } from "@/components/tool-icon";
import { ROUTES } from "@/constants/routes";
import { TOOLS } from "@/lib/tools";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const revalidate = false;
export const dynamic = "force-static";

const DESCRIPTION =
  "Free online converters for rich text: HTML to Markdown, Markdown to HTML, and Tiptap JSON. Everything runs in your browser, nothing is uploaded.";

export const metadata = createPageMetadata({
  description: DESCRIPTION,
  path: ROUTES.TOOLS,
  title: "Free Rich Text Converter Tools",
});

export default function ToolsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: "Tools", path: ROUTES.TOOLS },
        ]}
      />
      <PageTransition>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="h-(--top-spacing) shrink-0" />
          <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 px-4 py-8 lg:py-12">
            <header className="flex flex-col gap-2">
              <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Free rich text tools
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-balance text-muted-foreground">
                {DESCRIPTION}
              </p>
            </header>

            <div className="mb-24 rounded-xl border border-border/60 bg-muted/50 p-1">
              <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground">
                {TOOLS.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      className="group flex items-start gap-3 px-4 py-4 transition-colors duration-150 ease-out outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none sm:items-center sm:gap-4 sm:px-5"
                      href={`${ROUTES.TOOLS}/${tool.slug}`}
                      prefetch={false}
                    >
                      <ToolIcon format={tool.from} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                          <h2 className="text-sm font-semibold">
                            {tool.title}
                          </h2>
                          <ToolFormatLabel from={tool.from} to={tool.to} />
                        </div>
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {tool.intro}
                        </p>
                      </div>
                      <ChevronRightIcon
                        aria-hidden
                        className="mt-2 size-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground sm:mt-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5 text-xs text-muted-foreground">
                <span>
                  <span className="text-foreground tabular-nums">
                    {TOOLS.length}
                  </span>{" "}
                  converters
                </span>
                <span>Runs in your browser</span>
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
