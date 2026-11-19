"use client";

import { ArrowUpRightIcon, LayoutTemplateIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LINK } from "@/constants/links";
import { trackEvent } from "@/lib/events";
import { cn } from "@/lib/utils";

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

const DISMISS_KEY = `promo-dismissed:${PROMO.id}`;

type Variant = "floating" | "sidebar";

const track = (placement: Variant, target: string) =>
  trackEvent({
    name: "click_promo",
    properties: { placement, promo: PROMO.id, target },
  });

const PromoBody = ({
  variant,
  onDismiss,
}: {
  variant: Variant;
  onDismiss?: () => void;
}) => (
  <Card
    className={cn(
      "relative gap-3 rounded-xl border-border/60 p-4",
      variant === "floating"
        ? "shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)]"
        : "shadow-none"
    )}
  >
    {onDismiss && (
      <Button
        aria-label="Dismiss promotion"
        className="absolute top-2 right-2 size-7 rounded-md text-muted-foreground"
        onClick={onDismiss}
        size="icon"
        variant="ghost"
      >
        <XIcon />
      </Button>
    )}
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
    <div
      className={cn(
        "grid gap-2",
        variant === "floating" && "grid-cols-[1fr_auto]"
      )}
    >
      <Button asChild className="rounded-lg" size="sm">
        <a
          href={PROMO.cta.href}
          onClick={() => track(variant, "cta")}
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
          onClick={() => track(variant, "templates")}
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

const noopSubscribe = () => () => null;

const isStoredDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

const storeDismissed = () => {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    return false;
  }
  return true;
};

const FloatingPromo = () => {
  const storedDismissed = useSyncExternalStore(
    noopSubscribe,
    isStoredDismissed,
    () => true
  );
  const [dismissed, setDismissed] = useState(false);

  if (storedDismissed || dismissed) {
    return null;
  }

  const dismiss = () => {
    storeDismissed();
    setDismissed(true);
  };

  return (
    <aside
      aria-label={`${PROMO.title} promotion`}
      className="fixed right-4 bottom-4 z-40 hidden w-80 sm:block"
    >
      <PromoBody onDismiss={dismiss} variant="floating" />
    </aside>
  );
};

export const PromoCard = ({ variant }: { variant: Variant }) =>
  variant === "floating" ? <FloatingPromo /> : <PromoBody variant="sidebar" />;
