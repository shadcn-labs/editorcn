import { findNeighbour } from "fumadocs-core/page-tree";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocsCopyPage } from "@/components/docs-copy-page";
import { DocsKeyboardShortcuts } from "@/components/docs-keyboard-shortcuts";
import { DocsNavLink } from "@/components/docs-nav-link";
import { DocsShareMenu } from "@/components/docs-share-menu";
import { DocsTableOfContents } from "@/components/docs-toc";
import { DocsTocFooter } from "@/components/docs-toc-footer";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { formatTitleFromSlug } from "@/lib/docs";
import { source } from "@/lib/source";
import { absoluteUrl } from "@/lib/utils";
import { mdxComponents } from "@/mdx-components";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () => source.generateParams();

export const generateMetadata = async (props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> => {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const doc = page.data;

  return createPageMetadata({
    description: doc.description,
    ogType: "article",
    path: page.url,
    title: doc.seoTitle ?? doc.title,
  });
};

const buildBreadcrumbs = (
  slugs: string[],
  pageTitle: string,
  pageUrl: string
) => {
  const items: { name: string; path: string }[] = [{ name: "Home", path: "/" }];

  if (slugs.length === 0) {
    items.push({ name: pageTitle, path: pageUrl });
    return items;
  }

  items.push({ name: "Docs", path: ROUTES.DOCS });

  let currentPath = ROUTES.DOCS;
  for (let i = 0; i < slugs.length - 1; i += 1) {
    currentPath += `/${slugs[i]}`;
    items.push({ name: formatTitleFromSlug(slugs[i]), path: currentPath });
  }

  items.push({ name: pageTitle, path: pageUrl });
  return items;
};

const Page = async (props: { params: Promise<{ slug?: string[] }> }) => {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const doc = page.data;
  const MdxContent = doc.body;
  const neighbours = findNeighbour(source.pageTree, page.url);
  const { links } = doc as { links?: { doc?: string; api?: string } };
  const breadcrumbs = buildBreadcrumbs(params.slug ?? [], doc.title, page.url);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <DocsKeyboardShortcuts
        previous={neighbours.previous ? neighbours.previous.url : null}
        next={neighbours.next ? neighbours.next.url : null}
      />

      <PageTransition>
        <div
          data-slot="docs"
          className="flex items-stretch text-[15px] xl:w-full"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="h-(--top-spacing) shrink-0" />
            <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-foreground/85 md:px-0 lg:py-8">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {doc.title}
                    </h1>
                    <div className="docs-nav flex items-center gap-2">
                      <div className="hidden sm:block">
                        <DocsCopyPage
                          markdownUrl={`${absoluteUrl(page.url)}.md`}
                          url={absoluteUrl(page.url)}
                        />
                      </div>
                      <div className="ml-auto flex gap-2">
                        <DocsShareMenu
                          title={doc.title}
                          url={absoluteUrl(page.url)}
                        />
                        {neighbours.previous && (
                          <DocsNavLink
                            href={neighbours.previous.url}
                            transitionTypes={["nav-back"]}
                            className="extend-touch-target size-8 md:size-7"
                            tooltip={{
                              icon: <ArrowLeftIcon />,
                              title: "Previous Page",
                            }}
                          >
                            <span className="sr-only">Previous</span>
                          </DocsNavLink>
                        )}
                        {neighbours.next && (
                          <DocsNavLink
                            href={neighbours.next.url}
                            transitionTypes={["nav-forward"]}
                            className="extend-touch-target size-8 md:size-7"
                            tooltip={{
                              icon: <ArrowRightIcon />,
                              title: "Next Page",
                            }}
                          >
                            <span className="sr-only">Next</span>
                          </DocsNavLink>
                        )}
                      </div>
                    </div>
                  </div>
                  {doc.description && (
                    <p className="text-base leading-relaxed text-balance text-muted-foreground">
                      {doc.description}
                    </p>
                  )}
                </div>
                {links ? (
                  <div className="flex items-center gap-2 pt-3">
                    {links?.doc && (
                      <Badge
                        asChild
                        className="h-7 rounded-md border-border/60 bg-background px-2.5 font-medium text-foreground hover:bg-muted"
                        variant="outline"
                      >
                        <Link
                          href={links.doc}
                          target="_blank"
                          rel="noreferrer"
                          prefetch={false}
                        >
                          Docs <ArrowUpRightIcon />
                        </Link>
                      </Badge>
                    )}
                    {links?.api && (
                      <Badge
                        asChild
                        className="h-7 rounded-md border-border/60 bg-background px-2.5 font-medium text-foreground hover:bg-muted"
                        variant="outline"
                      >
                        <Link
                          href={links.api}
                          target="_blank"
                          rel="noreferrer"
                          prefetch={false}
                        >
                          API Reference <ArrowUpRightIcon />
                        </Link>
                      </Badge>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
                <MdxContent components={mdxComponents} />
              </div>
            </div>
            <nav
              aria-label="Pagination"
              className="mx-auto mb-8 hidden w-full max-w-2xl grid-cols-2 gap-3 px-4 sm:grid md:px-0"
            >
              {neighbours.previous ? (
                <Link
                  className="group flex flex-col gap-1 rounded-lg border border-border/60 bg-card px-4 py-3 text-card-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
                  href={neighbours.previous.url}
                  prefetch={false}
                  transitionTypes={["nav-back"]}
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeftIcon aria-hidden className="size-3.5" />
                    Previous
                  </span>
                  <span className="text-sm font-medium">
                    {neighbours.previous.name}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {neighbours.next ? (
                <Link
                  className="group flex flex-col items-end gap-1 rounded-lg border border-border/60 bg-card px-4 py-3 text-right text-card-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
                  href={neighbours.next.url}
                  prefetch={false}
                  transitionTypes={["nav-forward"]}
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    Next
                    <ArrowRightIcon aria-hidden className="size-3.5" />
                  </span>
                  <span className="text-sm font-medium">
                    {neighbours.next.name}
                  </span>
                </Link>
              ) : null}
            </nav>
          </div>
          <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--footer-height)+2rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
            <div className="h-(--top-spacing) shrink-0" />
            {doc.toc?.length ? (
              <div className="no-scrollbar overflow-y-auto mx-8 border-b">
                <DocsTableOfContents toc={doc.toc} />
              </div>
            ) : null}
            <DocsTocFooter docId={page.path} className="mx-8" />
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Page;
