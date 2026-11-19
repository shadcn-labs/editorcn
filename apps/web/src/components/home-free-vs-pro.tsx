import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  MinusIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const ROWS = [
  { feature: "Toolbar editor and Notion-style block editor", free: true },
  {
    feature: "Extensions: tables, code blocks, callouts, mentions and more",
    free: true,
  },
  {
    feature:
      "Free templates: comment box, email composer, simple document editor",
    free: true,
  },
  { feature: "Full source in your project via the shadcn CLI", free: true },
  { feature: "Personal and commercial projects", free: true },
  {
    feature: "AI chat composer with streaming replies and attachments",
    free: false,
  },
  {
    feature: "Google Docs-style editor with comments and version history",
    free: false,
  },
  {
    feature: "Blog post editor with SEO fields and Markdown export",
    free: false,
  },
  { feature: "Notion-style notes workspace", free: false },
  { feature: "Every future Pro template, with lifetime updates", free: false },
];

const PLAN = "w-20 px-2 sm:w-40 sm:px-5";
const PRO = "bg-muted/50";

const Included = ({ value }: { value: boolean }) =>
  value ? (
    <>
      <CheckIcon aria-hidden className="size-4" />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <MinusIcon aria-hidden className="size-4 text-muted-foreground/50" />
      <span className="sr-only">Not included</span>
    </>
  );

export const HomeFreeVsPro = ({ className }: { className?: string }) => (
  <div className={className}>
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <span className="text-sm text-muted-foreground">Free and Pro</span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
        Start free. Go further with Pro.
      </h2>
      <p className="mt-3 text-base text-balance text-muted-foreground">
        Everything in editorcn stays free. Pro adds complete editor apps you can
        drop into your product.
      </p>
    </div>

    <div className="mt-10 rounded-xl border border-border/60 bg-muted/50 p-1 sm:mt-12">
      <div className="overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            What editorcn and editorcn pro include
          </caption>
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 py-3 sm:px-5" scope="col">
                <span className="sr-only">Feature</span>
              </th>
              <th className={cn(PLAN, "py-3 text-left")} scope="col">
                <span className="block font-semibold">editorcn</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Free
                </span>
              </th>
              <th className={cn(PLAN, PRO, "py-3 text-left")} scope="col">
                <span className="block font-semibold">editorcn pro</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Lifetime
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ feature, free }) => (
              <tr className="border-b border-border/60" key={feature}>
                <th
                  className="px-4 py-3 text-left font-normal leading-snug sm:px-5"
                  scope="row"
                >
                  {feature}
                </th>
                <td className={cn(PLAN, "py-3")}>
                  <Included value={free} />
                </td>
                <td className={cn(PLAN, PRO, "py-3")}>
                  <Included value />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="px-4 py-3 sm:px-5" />
              <td className={cn(PLAN, "py-3")}>
                <Button
                  asChild
                  className="rounded-lg"
                  size="sm"
                  variant="outline"
                >
                  <Link href={ROUTES.DOCS} prefetch={false}>
                    Browse
                    <ArrowRightIcon aria-hidden className="hidden sm:block" />
                  </Link>
                </Button>
              </td>
              <td className={cn(PLAN, PRO, "py-3")}>
                <Button asChild className="rounded-lg" size="sm">
                  <a href={LINK.PRO_PRICING} rel="noopener" target="_blank">
                    Get Pro
                    <ArrowUpRightIcon aria-hidden className="hidden sm:block" />
                  </a>
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);
