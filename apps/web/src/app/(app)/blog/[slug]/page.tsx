import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocsShareMenu } from "@/components/docs-share-menu";
import { DocsTableOfContents } from "@/components/docs-toc";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { blogSource, formatPostDate } from "@/lib/blog";
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
          className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full"
          data-slot="docs"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="h-(--top-spacing) shrink-0" />
            <article className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
              <header className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Link
                    className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    href={ROUTES.BLOG}
                    prefetch={false}
                  >
                    <ArrowLeftIcon className="size-4" />
                    Blog
                  </Link>
                  <DocsShareMenu title={title} url={absoluteUrl(post.url)} />
                </div>
                <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                    {description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {author} · <time dateTime={date}>{formatPostDate(date)}</time>
                </p>
              </header>
              <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
                <MdxContent components={mdxComponents} />
              </div>
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
