import Link from "next/link";

import { PageTransition } from "@/components/page-transition";
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
        <div className="flex min-w-0 flex-1 flex-col text-[1.05rem] sm:text-[15px]">
          <div className="h-(--top-spacing) shrink-0" />
          <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
            <div className="flex flex-col gap-2">
              <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                Free rich text tools
              </h1>
              <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                {DESCRIPTION}
              </p>
            </div>
            <div className="mb-24 flex flex-col gap-3">
              {TOOLS.map((tool) => (
                <Link
                  className="flex w-full flex-col gap-1 rounded-xl bg-surface px-4 py-4 text-surface-foreground transition-colors hover:bg-surface/80"
                  href={`${ROUTES.TOOLS}/${tool.slug}`}
                  key={tool.slug}
                  prefetch={false}
                >
                  <h2 className="font-heading text-lg font-semibold tracking-tight">
                    {tool.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{tool.intro}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
