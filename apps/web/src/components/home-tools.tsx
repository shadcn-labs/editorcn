import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { ToolFormatLabel, ToolIcon } from "@/components/tool-icon";
import { ROUTES } from "@/constants/routes";
import { TOOLS } from "@/lib/tools";

export const HomeTools = ({ className }: { className?: string }) => (
  <div className={className}>
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <span className="text-sm text-muted-foreground">Free tools</span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
        Convert rich text in your browser
      </h2>
      <p className="mt-3 text-base text-balance text-muted-foreground">
        Switch between HTML, Markdown and Tiptap JSON. Nothing is uploaded.
      </p>
    </div>

    <div className="mt-10 rounded-xl border border-border/60 bg-muted/50 p-1 sm:mt-12">
      <ul className="grid gap-0.5 rounded-lg border border-border/60 bg-card p-1.5 text-card-foreground sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.slug}>
            <Link
              className="flex h-full items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors duration-150 ease-out outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
              href={`${ROUTES.TOOLS}/${tool.slug}`}
              prefetch={false}
            >
              <ToolIcon format={tool.from} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{tool.title}</span>
                <ToolFormatLabel from={tool.from} to={tool.to} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5 text-xs text-muted-foreground">
        <span>Runs in your browser</span>
        <Link
          className="inline-flex items-center gap-1 rounded-md font-medium text-foreground outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/50"
          href={ROUTES.TOOLS}
          prefetch={false}
        >
          All tools
          <ArrowRightIcon aria-hidden className="size-3.5" />
        </Link>
      </div>
    </div>
  </div>
);
