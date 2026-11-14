import { BlockViewer } from "@/components/block-viewer";
import type { BlockViewerItem } from "@/components/block-viewer";
import { CommandBox } from "@/components/command-box";
import { HomeCtas } from "@/components/home-ctas";
import { HomeCustomize } from "@/components/home-customize";
import { HomeTools } from "@/components/home-tools";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { PromoCard } from "@/components/promo-card";
import { RegistryCode } from "@/components/template-showcase";
import { Testimonials } from "@/components/testimonials";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

import commentBoxItem from "../../../../public/r/comment-box.json";
import fullBlockEditorItem from "../../../../public/r/full-block-editor.json";
import fullEditorItem from "../../../../public/r/full-editor.json";
import simpleDocumentEditorItem from "../../../../public/r/simple-document-editor.json";

const SHOWCASE: BlockViewerItem[] = [
  {
    category: "Editors",
    code: <RegistryCode files={fullEditorItem.files} />,
    docs: `${ROUTES.DOCS_EDITOR}#full-setup`,
    name: "full-editor",
    title: "Full Toolbar Editor",
  },
  {
    category: "Editors",
    code: <RegistryCode files={fullBlockEditorItem.files} />,
    docs: `${ROUTES.DOCS_BLOCK_EDITOR}#full-setup`,
    name: "full-block-editor",
    title: "Full Block Editor",
  },
  {
    category: "Templates",
    code: <RegistryCode files={simpleDocumentEditorItem.files} />,
    docs: `${ROUTES.DOCS_TEMPLATES}/simple-document-editor`,
    name: "simple-document-editor",
    title: "Simple Document Editor",
    wide: true,
  },
  {
    category: "Templates",
    code: <RegistryCode files={commentBoxItem.files} />,
    docs: `${ROUTES.DOCS_TEMPLATES}/comment-box`,
    name: "comment-box",
    title: "Comment Box",
  },
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
                React. <br className="hidden sm:block" />
                Built on Tiptap. Distributed via shadcn.
              </>
            }
            descriptionClassName="max-w-2xl text-base text-foreground/80 sm:text-lg"
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
            titleClassName="max-w-3xl leading-[1.1]"
          />

          <HomeCtas />

          <CommandBox className="mt-6 w-full max-w-xl" />
        </div>
      </section>

      <section className="container-wrapper">
        <div className="container">
          <BlockViewer items={SHOWCASE} />
        </div>
      </section>

      <section className="container-wrapper">
        <Testimonials className="container pt-16 md:pt-20 lg:pt-24" />
      </section>

      <section className="container-wrapper">
        <HomeCustomize className="container py-16 md:py-20 lg:py-24" />
      </section>

      <section className="container-wrapper">
        <HomeTools className="container pb-16 md:pb-20 lg:pb-24" />
      </section>
    </PageTransition>
    <PromoCard variant="floating" />
  </>
);
export default HomePage;
