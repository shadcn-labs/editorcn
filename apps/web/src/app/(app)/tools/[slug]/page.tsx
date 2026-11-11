import { ArrowLeftIcon, CheckIcon, ChevronRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComponentCode } from "@/components/component-code";
import { Converter } from "@/components/converter";
import { PageTransition } from "@/components/page-transition";
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

const frameClassName = "rounded-xl border border-border/60 bg-muted/50 p-1";

const framePanelClassName =
  "rounded-lg border border-border/60 bg-card text-card-foreground";

const headingClassName = "text-lg font-semibold tracking-tight text-foreground";

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
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="h-(--top-spacing) shrink-0" />
          <article className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-8 px-4 py-8 text-sm leading-relaxed text-foreground/80 lg:py-12">
            <header className="flex flex-col items-start gap-4">
              <Link
                className="-ml-1 inline-flex h-7 items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
                href={ROUTES.TOOLS}
                prefetch={false}
              >
                <ArrowLeftIcon className="size-4" />
                All tools
              </Link>
              <div className="flex flex-col gap-2">
                <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {tool.title}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-balance text-muted-foreground sm:text-base">
                  {tool.intro}
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {["Free", "No sign-up", "Runs in your browser"].map((label) => (
                  <li className="inline-flex items-center gap-1.5" key={label}>
                    <CheckIcon
                      aria-hidden
                      className="size-3.5 text-foreground"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </header>

            <Converter from={tool.from} sample={tool.sample} to={tool.to} />

            <div className="grid gap-12 pt-4 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
              <div className="flex max-w-2xl min-w-0 flex-col gap-12">
                <section className="flex flex-col gap-4">
                  <h2 className={headingClassName}>
                    How to convert {FORMAT_LABEL[tool.from]} to{" "}
                    {FORMAT_LABEL[tool.to]}
                  </h2>
                  <div className={frameClassName}>
                    <ol
                      className={`${framePanelClassName} divide-y divide-border/60`}
                    >
                      {steps.map((step, index) => (
                        <li
                          className="flex items-start gap-3 px-4 py-3"
                          key={step}
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-xs font-medium text-foreground tabular-nums">
                            {index + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>

                {sections.map((section) => (
                  <section
                    className="flex flex-col gap-3"
                    key={section.heading}
                  >
                    <h2 className={headingClassName}>{section.heading}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.items ? (
                      <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-muted-foreground">
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
                  <p>
                    This tool is a headless Tiptap editor, so the same
                    conversion takes a few lines in your app. See the{" "}
                    <Link className={linkClassName} href={tool.docs.href}>
                      {tool.docs.label}
                    </Link>{" "}
                    docs for details.
                  </p>
                  <ComponentCode
                    className="mt-1"
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
                  <div className={frameClassName}>
                    <div
                      className={`${framePanelClassName} divide-y divide-border/60`}
                    >
                      {tool.faq.map((item) => (
                        <div
                          className="flex flex-col gap-1 px-4 py-4"
                          key={item.question}
                        >
                          <h3 className="font-semibold text-foreground">
                            {item.question}
                          </h3>
                          <p className="text-muted-foreground">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <aside className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
                <nav
                  aria-labelledby="more-tools"
                  className="flex flex-col gap-1"
                >
                  <h2
                    className="px-2.5 pb-1 text-xs font-medium text-muted-foreground"
                    id="more-tools"
                  >
                    More free tools
                  </h2>
                  <ul className="flex flex-col">
                    {TOOLS.filter((other) => other.slug !== tool.slug).map(
                      (other) => (
                        <li key={other.slug}>
                          <Link
                            className="group flex min-h-8 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm leading-snug text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
                            href={`${ROUTES.TOOLS}/${other.slug}`}
                            prefetch={false}
                          >
                            {other.title.replace(/ Converter$/, "")}
                            <ChevronRightIcon
                              aria-hidden
                              className="size-3.5 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                            />
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
                <div className={frameClassName}>
                  <div
                    className={`${framePanelClassName} flex flex-col gap-1.5 p-4`}
                  >
                    <h2 className="text-sm font-semibold text-foreground">
                      Need a full rich text editor?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      editorcn gives you Tiptap editors styled for shadcn/ui.
                      Install one with a single command.
                    </p>
                  </div>
                  <div className="flex justify-end px-1 pt-1">
                    <Button asChild className="rounded-lg" size="sm">
                      <Link href={ROUTES.DOCS_GETTING_STARTED}>
                        Get started
                      </Link>
                    </Button>
                  </div>
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
