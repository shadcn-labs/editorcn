import { BlockEditorPreview } from "@/components/block-editor-preview";
import { CommandBox } from "@/components/command-box";
import { EditorPreview } from "@/components/editor-preview";
import { HomeCtas } from "@/components/home-ctas";
import { HomeCustomize } from "@/components/home-customize";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { TemplateDemo } from "@/components/template-demo";
import type { TemplateName } from "@/components/template-demo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

const TEMPLATES: { label: string; name: TemplateName }[] = [
  { label: "Document Editor", name: "simple-document-editor" },
  { label: "Comment Box", name: "comment-box" },
];

export const HomePage = () => (
  <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
    <PageTransition>
      <section className="container-wrapper relative">
        <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
          <PageHero
            description={
              <>
                Ready to use, customizable rich text editor components for
                React.
                <br className="hidden sm:block" />
                Built on Tiptap. Distributed via shadcn.
              </>
            }
            descriptionClassName="max-w-2xl text-lg sm:text-xl"
            showAnnouncement
            title={
              <>
                Build{" "}
                <mark className="rounded-md bg-yellow-200 px-2 text-foreground dark:bg-yellow-500/40">
                  beautiful
                </mark>{" "}
                rich text editors in minutes
                <span
                  aria-hidden
                  className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-[caret-blink_1s_step-end_infinite] rounded-full motion-reduce:animate-none bg-foreground"
                />
              </>
            }
            titleClassName="max-w-4xl bg-none text-foreground leading-[1.1] md:text-7xl"
          />

          <HomeCtas />

          <CommandBox className="mt-6 w-full max-w-xl shadow-sm" />
        </div>
      </section>

      <section className="container-wrapper">
        <Tabs className="container items-center gap-4" defaultValue="templates">
          <TabsList className="h-11 rounded-xl border bg-muted/60 p-1">
            <TabsTrigger className="rounded-lg px-4" value="editor">
              Toolbar editor
            </TabsTrigger>
            <TabsTrigger className="rounded-lg px-4" value="block-editor">
              Block editor
            </TabsTrigger>
            <TabsTrigger className="rounded-lg px-4" value="templates">
              Templates
            </TabsTrigger>
          </TabsList>

          <div className="w-full rounded-2xl border bg-muted/30 p-4 shadow-sm sm:p-8">
            <TabsContent className="mx-auto w-full max-w-3xl" value="editor">
              <EditorPreview variant="default" />
            </TabsContent>
            <TabsContent
              className="mx-auto w-full max-w-3xl"
              value="block-editor"
            >
              <BlockEditorPreview />
            </TabsContent>
            <TabsContent value="templates">
              <Tabs
                className="items-center gap-4"
                defaultValue="simple-document-editor"
              >
                <TabsList>
                  {TEMPLATES.map((t) => (
                    <TabsTrigger key={t.name} value={t.name}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {TEMPLATES.map((t) => (
                  <TabsContent key={t.name} className="w-full" value={t.name}>
                    <TemplateDemo name={t.name} />
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      <section className="container-wrapper">
        <HomeCustomize className="container py-16 md:py-20 lg:py-24" />
      </section>
    </PageTransition>
  </>
);
export default HomePage;
