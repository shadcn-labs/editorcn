import { ChevronRightIcon, RssIcon } from "lucide-react";
import Link from "next/link";

import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { formatPostDate, getBlogPosts } from "@/lib/blog";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const revalidate = false;
export const dynamic = "force-static";

const DESCRIPTION =
  "Guides and tutorials for building rich text editors in React with Tiptap and shadcn/ui.";

export const metadata = createPageMetadata({
  description: DESCRIPTION,
  path: ROUTES.BLOG,
  title: "Blog",
});

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: "Blog", path: ROUTES.BLOG },
        ]}
      />
      <PageTransition>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="h-(--top-spacing) shrink-0" />
          <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 px-4 py-8 lg:py-12">
            <header className="flex flex-col gap-2">
              <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Blog
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-balance text-muted-foreground">
                {DESCRIPTION}
              </p>
            </header>

            <div className="mb-24 rounded-xl border border-border/60 bg-muted/50 p-1">
              <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground">
                {posts.map((post) => (
                  <li key={post.url}>
                    <Link
                      className="group flex items-start gap-4 px-4 py-4 transition-colors duration-150 ease-out outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none sm:px-5"
                      href={post.url}
                      prefetch={false}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <time
                          className="text-xs text-muted-foreground tabular-nums"
                          dateTime={post.data.date}
                        >
                          {formatPostDate(post.data.date)}
                        </time>
                        <h2 className="text-sm font-semibold sm:text-base">
                          {post.data.title}
                        </h2>
                        {post.data.description ? (
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {post.data.description}
                          </p>
                        ) : null}
                      </div>
                      <ChevronRightIcon
                        aria-hidden
                        className="mt-6 size-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5 text-xs text-muted-foreground">
                <span>
                  <span className="text-foreground tabular-nums">
                    {posts.length}
                  </span>{" "}
                  posts
                </span>
                <a
                  className="inline-flex items-center gap-1 rounded-md font-medium text-foreground outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/50"
                  href={ROUTES.RSS}
                >
                  <RssIcon aria-hidden className="size-3.5" />
                  RSS
                </a>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
