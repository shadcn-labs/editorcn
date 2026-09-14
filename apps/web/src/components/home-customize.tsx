"use client";

import Link from "next/link";

import { ArrowRightIcon } from "@/components/animated-icons/arrow-right";
import type { ArrowRightIconHandle } from "@/components/animated-icons/arrow-right";
import {
  ControlsPreview,
  IconsPreview,
  ThemeCard,
  ThemePreview,
} from "@/components/landing-previews";
import { Button } from "@/components/ui/button";
import { useIconAnimation } from "@/hooks/use-icon-animation";

export const HomeCustomize = ({ className }: { className?: string }) => {
  const { iconRef, onMouseEnter, onMouseLeave } =
    useIconAnimation<ArrowRightIconHandle>();

  return (
    <div className={className}>
      <div>
        <h2 className="mb-2 text-lg font-medium tracking-tight text-foreground">
          Customize everything
        </h2>
        <p className="text-base text-muted-foreground">
          Icons, colors, controls — every part of the editor is yours to shape.
        </p>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <span className="inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[11px] font-medium tracking-wider text-background">
            Icons
          </span>
          <p className="text-sm text-muted-foreground">
            Swap any icon via the icons prop.
          </p>
          <IconsPreview />
        </div>
        <ThemeCard className="space-y-3">
          <span className="inline-flex h-5 items-center rounded-full bg-primary px-2 text-[11px] font-medium tracking-wider text-primary-foreground">
            Themes
          </span>
          <p className="text-sm text-muted-foreground">
            Override CSS variables for a completely different look.
          </p>
          <ThemePreview />
        </ThemeCard>
        <div className="space-y-3">
          <span className="inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[11px] font-medium tracking-wider text-background">
            Controls
          </span>
          <p className="text-sm text-muted-foreground">
            Add custom toolbar buttons using RichTextEditor.Control.
          </p>
          <ControlsPreview />
        </div>
      </div>
      <div className="mt-2">
        <Button
          asChild
          variant="link"
          className="px-0"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Link href="/docs/customization" prefetch={false}>
            Explore customization <ArrowRightIcon ref={iconRef} />
          </Link>
        </Button>
      </div>
    </div>
  );
};
