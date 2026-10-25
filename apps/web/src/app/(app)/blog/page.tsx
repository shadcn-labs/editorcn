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
        <div className="flex min-w-0 flex-1 flex-col text-[1.05rem] sm:text-[15px]">
          <div className="h-(--top-spacing) shrink-0" />
          <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
            <div className="flex flex-col gap-2">
              <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                Blog
              </h1>
              <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                {DESCRIPTION}
              </p>
            </div>
            <div className="mb-24 flex flex-col gap-3">
              {posts.map((post) => (
                <Link
                  className="flex w-full flex-col gap-1 rounded-xl bg-surface px-4 py-4 text-surface-foreground transition-colors hover:bg-surface/80"
                  href={post.url}
                  key={post.url}
                  prefetch={false}
                >
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={post.data.date}
                  >
                    {formatPostDate(post.data.date)}
                  </time>
                  <h2 className="font-heading text-lg font-semibold tracking-tight">
                    {post.data.title}
                  </h2>
                  {post.data.description && (
                    <p className="text-sm text-muted-foreground">
                      {post.data.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
