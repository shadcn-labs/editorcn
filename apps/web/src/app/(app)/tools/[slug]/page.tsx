import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComponentCode } from "@/components/component-code";
import { Converter } from "@/components/converter";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { highlightCode } from "@/lib/highlight-code";
import type { Format, Tool } from "@/lib/tools";
import { FORMAT_LABEL, TOOL_SECTIONS, TOOLS, getTool } from "@/lib/tools";
import { BreadcrumbJsonLd, WebApplicationJsonLd } from "@/seo/json-ld";
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

const headingClassName =
  "text-2xl font-semibold tracking-tight text-foreground";

const linkClassName =
  "font-medium text-foreground underline underline-offset-4";

const ToolPage = async (props: { params: Promise<{ slug: string }> }) => {
  const tool = await getToolOrNotFound(props.params);
  const path = `${ROUTES.TOOLS}/${tool.slug}`;
  const code = usageCode(tool);
  const highlighted = await highlightCode(code, "ts");
  const sections = TOOL_SECTIONS[tool.slug] ?? [];
  const steps = [
    `Paste your ${FORMAT_LABEL[tool.from]} into the input panel, or upload a file.`,
    `The ${FORMAT_LABEL[tool.to]} output updates as you type.`,
    "Open the Preview tab to check how the content renders.",
    "Copy the result with the copy button.",
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: "Tools", path: ROUTES.TOOLS },
          { name: tool.title, path },
        ]}
      />
      <WebApplicationJsonLd
        description={tool.description}
        name={tool.title}
        path={path}
      />
      <PageTransition>
        <div className="flex min-w-0 flex-1 flex-col text-[1.05rem] sm:text-[15px]">
          <div className="h-(--top-spacing) shrink-0" />
          <article className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-10 px-4 py-6 text-neutral-800 lg:py-10 dark:text-neutral-300">
            <header className="flex flex-col gap-4">
              <Link
                className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                href={ROUTES.TOOLS}
                prefetch={false}
              >
                <ArrowLeftIcon className="size-4" />
                All tools
              </Link>
              <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                {tool.title}
              </h1>
              <p className="max-w-2xl text-base text-balance text-muted-foreground sm:text-lg">
                {tool.intro}
              </p>
              <div className="flex flex-wrap gap-2">
                {["Free", "No sign-up", "Runs in your browser"].map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </header>

            <Converter from={tool.from} sample={tool.sample} to={tool.to} />

            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="flex max-w-2xl min-w-0 flex-col gap-12">
                <section className="flex flex-col gap-4">
                  <h2 className={headingClassName}>
                    How to convert {FORMAT_LABEL[tool.from]} to{" "}
                    {FORMAT_LABEL[tool.to]}
                  </h2>
                  <ol className="flex flex-col gap-3">
                    {steps.map((step, index) => (
                      <li className="flex items-start gap-3" key={step}>
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-foreground tabular-nums">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                {sections.map((section) => (
                  <section
                    className="flex flex-col gap-3"
                    key={section.heading}
                  >
                    <h2 className={headingClassName}>{section.heading}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p className="leading-relaxed" key={paragraph}>
                        {paragraph}
                      </p>
                    ))}
                    {section.items ? (
                      <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed marker:text-muted-foreground">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}

                <section className="flex flex-col gap-3">
                  <h2 className={headingClassName}>
                    Convert {FORMAT_LABEL[tool.from]} to {FORMAT_LABEL[tool.to]}{" "}
                    in your own code
                  </h2>
                  <p className="leading-relaxed">
                    This tool is a headless Tiptap editor, so the same
                    conversion takes a few lines in your app. See the{" "}
                    <Link className={linkClassName} href={tool.docs.href}>
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
                </section>

                <section className="mb-12 flex flex-col gap-4">
                  <h2 className={headingClassName}>
                    Frequently asked questions
                  </h2>
                  <div className="divide-y rounded-xl border">
                    {tool.faq.map((item) => (
                      <div
                        className="flex flex-col gap-1 p-4"
                        key={item.question}
                      >
                        <h3 className="font-semibold text-foreground">
                          {item.question}
                        </h3>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
                <div className="flex flex-col gap-3 rounded-xl border p-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    More free tools
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {TOOLS.filter((other) => other.slug !== tool.slug).map(
                      (other) => (
                        <li key={other.slug}>
                          <Link
                            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            href={`${ROUTES.TOOLS}/${other.slug}`}
                            prefetch={false}
                          >
                            {other.title.replace(/ Converter$/, "")}
                            <ArrowRightIcon className="size-3.5 shrink-0" />
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    Need a full rich text editor?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    editorcn gives you Tiptap editors styled for shadcn/ui.
                    Install one with a single command.
                  </p>
                  <Button asChild size="sm">
                    <Link href={ROUTES.DOCS_GETTING_STARTED}>Get started</Link>
                  </Button>
                </div>
              </aside>
            </div>
          </article>
        </div>
      </PageTransition>
    </>
  );
};

export default ToolPage;
