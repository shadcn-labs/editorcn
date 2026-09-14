"use client";

import Link from "next/link";

import { ArrowRightIcon } from "@/components/animated-icons/arrow-right";
import type { ArrowRightIconHandle } from "@/components/animated-icons/arrow-right";
import type { ComponentIconHandle } from "@/components/animated-icons/component";
import { ComponentIcon } from "@/components/animated-icons/component";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useIconAnimation } from "@/hooks/use-icon-animation";
import { cn } from "@/lib/utils";

const GetStartedButton = () => {
  const { iconRef, onMouseEnter, onMouseLeave } =
    useIconAnimation<ArrowRightIconHandle>();

  return (
    <Button
      asChild
      sound="click"
      className="px-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={ROUTES.DOCS}
        prefetch={false}
        transitionTypes={["nav-forward"]}
      >
        Get Started
        <ArrowRightIcon className="hidden sm:inline" ref={iconRef} />
      </Link>
    </Button>
  );
};

const BrowseComponentsButton = () => {
  const { iconRef, onMouseEnter, onMouseLeave } =
    useIconAnimation<ComponentIconHandle>();

  return (
    <Button
      asChild
      variant="outline"
      sound="click"
      className="px-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={ROUTES.DOCS_EDITOR}
        prefetch={false}
        transitionTypes={["nav-forward"]}
      >
        <ComponentIcon className="hidden sm:inline" ref={iconRef} />
        Browse Editor
      </Link>
    </Button>
  );
};

export const HomeCtas = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-center gap-4 mt-4",
      className
    )}
  >
    <GetStartedButton />
    <BrowseComponentsButton />
  </div>
);
