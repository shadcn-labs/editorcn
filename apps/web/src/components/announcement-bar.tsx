import { ArrowRightIcon, SparkleIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { LINK } from "@/constants/links";

const MESSAGES = [
  "editorcn pro is live",
  "Chat composer, document editor, blog editor and Notion-style notes",
  "One payment, lifetime updates",
  "Install with the shadcn CLI",
];

const TRACK = [0, 1, 2].flatMap((round) =>
  MESSAGES.map((message, index) => ({
    bold: index === 0,
    id: `${round}-${index}`,
    message,
  }))
);

const Track = () => (
  <div className="animate-marquee flex shrink-0 items-center gap-(--marquee-gap) group-hover:[animation-play-state:paused]">
    {TRACK.map(({ bold, id, message }) => (
      <span className="flex shrink-0 items-center gap-(--marquee-gap)" key={id}>
        <span className={bold ? "font-semibold" : "text-primary-foreground/70"}>
          {message}
        </span>
        <SparkleIcon
          aria-hidden
          className="size-3 fill-current text-primary-foreground/40"
        />
      </span>
    ))}
  </div>
);

export const AnnouncementBar = () => (
  <a
    aria-label="editorcn pro is live: get it"
    className="group flex h-11 items-center gap-3 bg-primary pr-3 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
    href={LINK.PRO}
    rel="noopener"
    target="_blank"
  >
    <div
      aria-hidden
      className="flex min-w-0 flex-1 gap-(--marquee-gap) overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_92%,transparent)]"
      style={
        {
          "--marquee-duration": "60s",
          "--marquee-gap": "1.5rem",
        } as CSSProperties
      }
    >
      <Track />
      <Track />
    </div>
    <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-background px-3 text-xs font-medium text-foreground transition-colors duration-150 ease-out group-hover:bg-background/90 motion-reduce:transition-none">
      Get it
      <ArrowRightIcon
        aria-hidden
        className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </span>
  </a>
);
