"use client";

import { ArrowUpRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

import { CopyButton } from "@/components/copy-button";
import { GithubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LINK } from "@/constants/links";
import { trackEvent } from "@/lib/events";
import { cn } from "@/lib/utils";

const PROMO = {
  command: "uvx tristack my-api",
  cta: { href: LINK.TRISTACK_NEW, label: "Build your stack" },
  description:
    "Scaffold production-ready Python, Go, and Rust projects from one CLI. Open source, zero lock-in.",
  eyebrow: "From the editorcn author",
  id: "tristack",
  logo: "/tristack.png",
  secondary: { href: LINK.TRISTACK_GITHUB, label: "GitHub" },
  title: "TriStack",
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
      "relative gap-3 p-4",
      variant === "floating" ? "shadow-lg" : "shadow-none"
    )}
  >
    {onDismiss && (
      <Button
        aria-label="Dismiss promotion"
        className="absolute top-2 right-2 size-7 text-muted-foreground"
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
        className="size-9 rounded-md border"
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
    {variant === "floating" && (
      <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 py-1 pr-1 pl-3">
        <code className="truncate font-mono text-xs">{PROMO.command}</code>
        <CopyButton
          aria-label="Copy command"
          className="static size-7 shrink-0 bg-transparent"
          event="copy_promo_command"
          value={PROMO.command}
        />
      </div>
    )}
    <div
      className={cn(
        "grid gap-2",
        variant === "floating" && "grid-cols-[1fr_auto]"
      )}
    >
      <Button asChild size="sm">
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
      <Button asChild size="sm" variant="outline">
        <a
          href={PROMO.secondary.href}
          onClick={() => track(variant, "github")}
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubIcon />
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
