"use client";

import { ArrowUpRightIcon, LayoutTemplateIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LINK } from "@/constants/links";
import { trackEvent } from "@/lib/events";

const PROMO = {
  cta: { href: LINK.PRO_PRICING, label: "Get lifetime access" },
  description:
    "Ready-made editor apps built on editorcn: a chat composer, a document editor, a blog post editor, and a Notion-style notes workspace. Install them with the shadcn CLI.",
  eyebrow: "From the editorcn author",
  id: "editorcn-pro",
  logo: "/apple-touch-icon.png",
  secondary: { href: LINK.PRO_TEMPLATES, label: "Templates" },
  title: "editorcn pro",
} as const;

const track = (target: string) =>
  trackEvent({
    name: "click_promo",
    properties: { placement: "sidebar", promo: PROMO.id, target },
  });

export const PromoCard = () => (
  <Card className="relative gap-3 rounded-xl border-border/60 p-4 shadow-none">
    <div className="flex items-center gap-3">
      <Image
        alt=""
        className="size-8 rounded-md border"
        height={36}
        src={PROMO.logo}
        width={36}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.7rem] text-muted-foreground">
          {PROMO.eyebrow}
        </span>
        <span className="font-semibold leading-none">{PROMO.title}</span>
      </div>
    </div>
    <p className="text-[0.8rem] text-muted-foreground">{PROMO.description}</p>
    <div className="grid gap-2">
      <Button asChild className="rounded-lg" size="sm">
        <a
          href={PROMO.cta.href}
          onClick={() => track("cta")}
          rel="noopener noreferrer"
          target="_blank"
        >
          {PROMO.cta.label}
          <ArrowUpRightIcon />
        </a>
      </Button>
      <Button asChild className="rounded-lg" size="sm" variant="outline">
        <a
          href={PROMO.secondary.href}
          onClick={() => track("templates")}
          rel="noopener noreferrer"
          target="_blank"
        >
          <LayoutTemplateIcon />
          {PROMO.secondary.label}
        </a>
      </Button>
    </div>
  </Card>
);
