"use client";

import Marquee from "react-fast-marquee";

import { cn } from "@/lib/cn";

interface Testimonial {
  authorAvatar: string;
  authorName: string;
  authorTagline: string;
  url: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1924504051728670720/mqyGd02m_normal.jpg",
    authorName: "Gurbinder",
    authorTagline: "@legionsdev",
    quote: "sheeeesh, looking for this from 2 years finally someone made it",
    url: "https://x.com/legionsdev/status/2092623214262493673",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2093960453110341632/s4mwOoGb_normal.jpg",
    authorName: "Chen",
    authorTagline: "@chenzhangreal",
    quote:
      "a rich text editor kit in shadcn’s style solves a very painful gap for anyone building docs tools.",
    url: "https://x.com/chenzhangreal/status/2106107451057766648",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2092232979548614656/idaakuhL_normal.jpg",
    authorName: "Umar",
    authorTagline: "@umar_who_code",
    quote: "Nice work man. This looks awesome. Will definitely give it a try",
    url: "https://x.com/umar_who_code/status/2092691121579434104",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1756766826736893952/6Gvg6jha_normal.jpg",
    authorName: "OrcDev",
    authorTagline: "@orcdev",
    quote: "interesting! good idea Aniket",
    url: "https://x.com/orcdev/status/2092930939093430622",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1827705177605812224/2OrDyYjL_normal.jpg",
    authorName: "Vineet Mangal",
    authorTagline: "@namevinu",
    quote:
      "Brilliant. Looking for something like this to integrate this directly in my app",
    url: "https://x.com/namevinu/status/2092620233819484481",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2101524369654824960/TLMmV94Y_normal.jpg",
    authorName: "Bashbits",
    authorTagline: "@bashbitsio",
    quote:
      "I was looking this for very long time for one of the client project",
    url: "https://x.com/bashbitsio/status/2106147793765314693",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2075958174746865664/Jwfil4KB_normal.jpg",
    authorName: "Rakibul",
    authorTagline: "@rakibulism",
    quote: "feels modern and fresh",
    url: "https://x.com/rakibulism/status/2092667242978971895",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2045091049803005952/B6fcwWtC_normal.jpg",
    authorName: "Florian Boelter",
    authorTagline: "@flboelter",
    quote: "You guys just can’t stop eh? Love it",
    url: "https://x.com/flboelter/status/2106287535013994993",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1957717329397141507/7ctDgOuc_normal.jpg",
    authorName: "Ajay Patel",
    authorTagline: "@ajaypatel_aj",
    quote: "Congrats on the launch, Aniket!! Added editcn to AllShadcn",
    url: "https://x.com/ajaypatel_aj/status/2092909960502124985",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2019397807418011652/13HvVUYt_normal.jpg",
    authorName: "Raghvendra Dwivedi",
    authorTagline: "@raghavdwd",
    quote:
      "ohh nice, i was trying to find something like this to integrate in my app. btw good product",
    url: "https://x.com/raghavdwd/status/2092812331881463913",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2105960660483874816/RviHyT2c_normal.jpg",
    authorName: "Samuel P. Ntekob",
    authorTagline: "@samuelpntekob",
    quote: "I was literally looking for this now to add to a project",
    url: "https://x.com/samuelpntekob/status/2106745665682280937",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1788616241663393792/VbjG_Cky_normal.jpg",
    authorName: "Krishna Singh",
    authorTagline: "@krishnasinghdev",
    quote: "great project aniket",
    url: "https://x.com/krishnasinghdev/status/2092645522700181580",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2103016892038365184/7e81IYKN_normal.jpg",
    authorName: "Nil . Dev .",
    authorTagline: "@Nil_phy_dreamer",
    quote: "Hats off to the idea..",
    url: "https://x.com/Nil_phy_dreamer/status/2092689478812868670",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/2063627005753778176/JVC810VY_normal.jpg",
    authorName: "Manish Kumar",
    authorTagline: "@Manixh02",
    quote: "thx for building this man",
    url: "https://x.com/Manixh02/status/2092625939490635860",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1980941914699427840/sk9VsEAk_normal.jpg",
    authorName: "Dharmvir",
    authorTagline: "@dharmvir_",
    quote: "Thanks for building this",
    url: "https://x.com/dharmvir_/status/2092634382339313689",
  },
];

const TestimonialRow = ({
  data,
  direction,
}: {
  data: Testimonial[];
  direction?: "left" | "right";
}) => (
  <div className="relative w-full overflow-hidden">
    <div className="absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-background to-transparent" />
    <div className="absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-background to-transparent" />
    <Marquee autoFill direction={direction} pauseOnHover>
      {data.map((item) => (
        <a
          className="block h-full w-xs border-r transition-colors hover:bg-accent/40"
          href={item.url}
          key={item.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <figure className="flex h-full flex-col">
            <blockquote className="min-h-14 grow px-4 py-3 text-base text-pretty text-foreground">
              <p>{item.quote}</p>
            </blockquote>
            <figcaption className="grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-x-3.5 px-4 pt-1 pb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={item.authorName}
                className="row-span-2 size-8 rounded-full ring-1 ring-black/10 select-none dark:ring-white/15"
                src={item.authorAvatar}
              />
              <span className="text-sm/4.5 font-semibold text-foreground">
                {item.authorName}
              </span>
              <span className="text-xs/4 text-balance text-muted-foreground">
                {item.authorTagline}
              </span>
            </figcaption>
          </figure>
        </a>
      ))}
    </Marquee>
  </div>
);

export const Testimonials = ({ className }: { className?: string }) => {
  if (TESTIMONIALS.length === 0) {
    return null;
  }

  const half = Math.ceil(TESTIMONIALS.length / 2);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <h2 className="text-center text-3xl font-semibold tracking-tight">
        Loved by developers
      </h2>
      <p className="text-center text-base text-balance text-muted-foreground">
        What people are saying about editorcn.
      </p>
      <div className="mt-6 flex w-full flex-col border-y">
        <TestimonialRow data={TESTIMONIALS.slice(0, half)} />
        {TESTIMONIALS.length > 1 && (
          <>
            <div className="h-4 border-y" />
            <TestimonialRow data={TESTIMONIALS.slice(half)} direction="right" />
          </>
        )}
      </div>
    </div>
  );
};
