import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const TEMPLATES = [
  {
    description:
      "Threaded comments with avatars, emoji reactions, replies, mentions, and an editor composer.",
    name: "comment-box",
    tags: ["Mentions", "Reactions", "Replies"],
    title: "Comment Box",
  },
  {
    description:
      "A Google Docs-style page with a floating toolbar, tables, images, Markdown import and export, and word count.",
    name: "simple-document-editor",
    tags: ["Toolbar", "Tables", "Markdown"],
    title: "Simple Document Editor",
  },
] as const;

export const TemplateGallery = ({ exclude }: { exclude?: string }) => (
  <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
    {TEMPLATES.filter((template) => template.name !== exclude).map(
      (template) => (
        <Link
          key={template.name}
          className="group flex flex-col rounded-xl border border-border/60 bg-muted/50 p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          href={`${ROUTES.DOCS_TEMPLATES}/${template.name}`}
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border/60 bg-card">
            <iframe
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-25 border-0"
              loading="lazy"
              src={`/preview/${template.name}`}
              tabIndex={-1}
              title={`${template.title} preview`}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5 px-3 pt-3 pb-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {template.title}
              </h3>
              <ArrowRightIcon
                aria-hidden
                className="size-4 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {template.description}
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1.5">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      )
    )}
  </div>
);
