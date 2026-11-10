"use client";

import {
  ArrowRightIcon,
  PaletteIcon,
  ShapesIcon,
  SquarePlusIcon,
} from "lucide-react";
import Link from "next/link";

import {
  ControlsPreview,
  IconsPreview,
  ThemeCard,
  ThemePreview,
} from "@/components/landing-previews";

const FEATURES = [
  {
    description: "Swap any toolbar icon through the icons prop.",
    href: "/docs/customization",
    icon: ShapesIcon,
    preview: <IconsPreview />,
    title: "Icons",
  },
  {
    description: "Override CSS variables for a completely different look.",
    href: "/docs/customization",
    icon: PaletteIcon,
    preview: (
      <ThemeCard>
        <ThemePreview />
      </ThemeCard>
    ),
    title: "Themes",
  },
  {
    description: "Add your own toolbar buttons with RichTextEditor.Control.",
    href: "/docs/customization",
    icon: SquarePlusIcon,
    preview: <ControlsPreview />,
    title: "Controls",
  },
];

export const HomeCustomize = ({ className }: { className?: string }) => (
  <div className={className}>
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <span className="text-sm text-muted-foreground">Customization</span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
        Shape the editor around your product
      </h2>
      <p className="mt-3 text-base text-balance text-muted-foreground">
        You own the code. Change icons, colors and controls without fighting the
        library.
      </p>
    </div>

    <h3 className="mt-10 mb-3 text-xs font-medium text-muted-foreground sm:mt-12">
      Explore customization
    </h3>
    <div className="grid gap-1 rounded-xl border border-border/60 bg-muted/50 p-1 lg:grid-cols-3">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card p-5"
        >
          <span className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-background">
            <feature.icon className="size-4 text-foreground" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {feature.title}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
          <div className="flex-1 max-sm:[&_.ProseMirror]:min-h-24! max-sm:[&_.ProseMirror]:p-3!">
            {feature.preview}
          </div>
          <Link
            href={feature.href}
            prefetch={false}
            className="group inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium text-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
          >
            Learn more
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      ))}
    </div>
  </div>
);
