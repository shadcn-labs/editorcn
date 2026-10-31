import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComponentCode } from "@/components/component-code";
import { Converter } from "@/components/converter";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { highlightCode } from "@/lib/highlight-code";
import type { Format, Tool } from "@/lib/tools";
import { FORMAT_LABEL, TOOLS, getTool } from "@/lib/tools";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () =>
  TOOLS.map((tool) => ({ slug: tool.slug }));

const getToolOrNotFound = async (params: Promise<{ slug: string }>) => {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    notFound();
  }
  return tool;
};

const LOAD: Record<Format, string> = {
  html: "editor.commands.setContent(html);",
  json: "editor.commands.setContent(json);",
  markdown:
    'editor.commands.setContent(markdown, { contentType: "markdown" });',
};

const READ: Record<Format, string> = {
  html: "const html = editor.getHTML();",
  json: "const json = editor.getJSON();",
  markdown: "const markdown = editor.getMarkdown();",
};

const usageCode = ({ from, to }: Tool) => {
  const markdown = from === "markdown" || to === "markdown";
  return [
    'import { Editor } from "@tiptap/core";',
    'import { StarterKit } from "@tiptap/starter-kit";',
    ...(markdown ? ['import { Markdown } from "@tiptap/markdown";'] : []),
    "",
    "const editor = new Editor({",
    "  element: null,",
    `  extensions: [StarterKit${markdown ? ", Markdown" : ""}],`,
    "});",
    "",
    LOAD[from],
    READ[to],
  ].join("\n");
};

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const tool = await getToolOrNotFound(props.params);

  return createPageMetadata({
    description: tool.description,
    path: `${ROUTES.TOOLS}/${tool.slug}`,
    title: tool.seoTitle,
  });
};

const ToolPage = async (props: { params: Promise<{ slug: string }> }) => {
  const tool = await getToolOrNotFound(props.params);
  const path = `${ROUTES.TOOLS}/${tool.slug}`;
  const code = usageCode(tool);
  const highlighted = await highlightCode(code, "ts");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: "Tools", path: ROUTES.TOOLS },
          { name: tool.title, path },
        ]}
      />
      <PageTransition>
        <div className="flex min-w-0 flex-1 flex-col text-[1.05rem] sm:text-[15px]">
          <div className="h-(--top-spacing) shrink-0" />
          <article className="mx-auto flex w-full max-w-5xl min-w-0 flex-1 flex-col gap-10 px-4 py-6 text-neutral-800 lg:py-8 dark:text-neutral-300">
            <header className="flex flex-col gap-3">
              <Link
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                href={ROUTES.TOOLS}
                prefetch={false}
              >
                <ArrowLeftIcon className="size-4" />
                Tools
              </Link>
              <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                {tool.title}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-[1.05rem] text-balance sm:text-base">
                {tool.intro}
              </p>
            </header>

            <Converter from={tool.from} sample={tool.sample} to={tool.to} />

            <section className="flex max-w-2xl flex-col gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">
                Convert {FORMAT_LABEL[tool.from]} to {FORMAT_LABEL[tool.to]} in
                your own code
              </h2>
              <p>
                This tool is a headless Tiptap editor. The same conversion takes
                a few lines in your app. See the{" "}
                <Link
                  className="underline underline-offset-4"
                  href={tool.docs.href}
                >
                  {tool.docs.label}
                </Link>{" "}
                docs for details.
              </p>
              <ComponentCode
                code={code}
                highlightedCode={highlighted}
                language="ts"
                title="convert.ts"
              />
              <p>
                Need a full editor instead?{" "}
                <Link
                  className="underline underline-offset-4"
                  href={ROUTES.DOCS_GETTING_STARTED}
                >
                  Add the editorcn rich text editor
                </Link>{" "}
                to your shadcn/ui app with one command.
              </p>
            </section>

            <section className="flex max-w-2xl flex-col gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
              {tool.faq.map((item) => (
                <div className="flex flex-col gap-1" key={item.question}>
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </section>

            <section className="mb-24 flex max-w-2xl flex-col gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">
                More free tools
              </h2>
              <ul className="flex flex-col gap-1">
                {TOOLS.filter((other) => other.slug !== tool.slug).map(
                  (other) => (
                    <li key={other.slug}>
                      <Link
                        className="underline underline-offset-4"
                        href={`${ROUTES.TOOLS}/${other.slug}`}
                        prefetch={false}
                      >
                        {other.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </section>
          </article>
        </div>
      </PageTransition>
    </>
  );
};

export default ToolPage;
