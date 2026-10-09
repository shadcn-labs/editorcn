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
      <h2 className="mt-4 text-3xl font-medium tracking-tight text-balance text-foreground sm:text-5xl">
        Shape the editor around your product
      </h2>
      <p className="mt-4 text-base text-balance text-muted-foreground sm:text-lg">
        You own the code. Change icons, colors and controls without fighting the
        library.
      </p>
    </div>

    <h3 className="mt-16 mb-4 font-medium text-foreground">
      Explore customization
    </h3>
    <div className="grid gap-4 lg:grid-cols-3">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="flex flex-col gap-4 rounded-2xl border bg-card p-6"
        >
          <feature.icon className="size-6 text-foreground" />
          <div>
            <h4 className="font-medium text-foreground">{feature.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
          <div className="flex-1">{feature.preview}</div>
          <Link
            href={feature.href}
            prefetch={false}
            className="group inline-flex w-fit items-center gap-1 text-sm font-medium text-foreground"
          >
            Learn more
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      ))}
    </div>
  </div>
);
