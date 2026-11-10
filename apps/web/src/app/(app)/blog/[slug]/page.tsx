import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocsShareMenu } from "@/components/docs-share-menu";
import { DocsTableOfContents } from "@/components/docs-toc";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { blogSource, formatPostDate, getBlogPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/utils";
import { mdxComponents } from "@/mdx-components";
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () =>
  blogSource.getPages().map((post) => ({ slug: post.slugs[0] }));

const getPost = async (params: Promise<{ slug: string }>) => {
  const { slug } = await params;
  const post = blogSource.getPage([slug]);
  if (!post) {
    notFound();
  }
  return post;
};

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const post = await getPost(props.params);

  return createPageMetadata({
    description: post.data.description,
    ogType: "article",
    path: post.url,
    title: post.data.title,
  });
};

const BlogPostPage = async (props: { params: Promise<{ slug: string }> }) => {
  const post = await getPost(props.params);
  const { author, date, description, title, toc } = post.data;
  const MdxContent = post.data.body;
  const morePosts = getBlogPosts()
    .filter((other) => other.url !== post.url)
    .slice(0, 3);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: "Blog", path: ROUTES.BLOG },
          { name: title, path: post.url },
        ]}
      />
      <BlogPostingJsonLd
        author={author}
        date={date}
        description={description}
        path={post.url}
        title={title}
      />
      <PageTransition>
        <div
          className="flex items-stretch text-[15px] xl:w-full"
          data-slot="docs"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="h-(--top-spacing) shrink-0" />
            <article className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-8 text-foreground/85 md:px-0 lg:py-12">
              <header className="flex flex-col gap-3 border-b border-border/60 pb-8">
                <div className="flex items-center justify-between">
                  <Link
                    className="-ml-1 inline-flex h-7 items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
                    href={ROUTES.BLOG}
                    prefetch={false}
                  >
                    <ArrowLeftIcon className="size-4" />
                    Blog
                  </Link>
                  <DocsShareMenu title={title} url={absoluteUrl(post.url)} />
                </div>
                <h1 className="mt-2 scroll-m-20 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
                  {title}
                </h1>
                {description && (
                  <p className="text-base leading-relaxed text-balance text-muted-foreground">
                    {description}
                  </p>
                )}
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{author}</span>
                  <span aria-hidden className="h-3 w-px bg-border" />
                  <time className="tabular-nums" dateTime={date}>
                    {formatPostDate(date)}
                  </time>
                </p>
              </header>
              <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
                <MdxContent components={mdxComponents} />
              </div>
              {morePosts.length ? (
                <nav
                  aria-labelledby="more-posts"
                  className="mb-12 flex flex-col gap-3 border-t border-border/60 pt-8"
                >
                  <h2
                    className="text-xs font-medium text-muted-foreground"
                    id="more-posts"
                  >
                    More from the blog
                  </h2>
                  <div className="rounded-xl border border-border/60 bg-muted/50 p-1">
                    <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground">
                      {morePosts.map((other) => (
                        <li key={other.url}>
                          <Link
                            className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none"
                            href={other.url}
                            prefetch={false}
                          >
                            <span className="min-w-0 flex-1 text-sm font-medium">
                              {other.data.title}
                            </span>
                            <time
                              className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:block"
                              dateTime={other.data.date}
                            >
                              {formatPostDate(other.data.date)}
                            </time>
                            <ChevronRightIcon
                              aria-hidden
                              className="size-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>
              ) : null}
            </article>
          </div>
          <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--footer-height)+2rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
            <div className="h-(--top-spacing) shrink-0" />
            {toc?.length ? (
              <div className="no-scrollbar mx-8 overflow-y-auto">
                <DocsTableOfContents toc={toc} />
              </div>
            ) : null}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default BlogPostPage;
