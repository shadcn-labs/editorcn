import Image from "next/image";
import Link from "next/link";

export const ListCard = ({
  description,
  href,
  meta,
  title,
}: {
  description?: string;
  href: string;
  meta?: React.ReactNode;
  title: string;
}) => (
  <Link
    className="group flex w-full flex-col gap-4 rounded-xl bg-surface p-3 text-surface-foreground transition-colors hover:bg-surface/80 sm:flex-row sm:items-center"
    href={href}
    prefetch={false}
  >
    <div className="aspect-[40/21] w-full shrink-0 overflow-hidden rounded-lg border sm:w-48">
      <Image
        alt=""
        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        height={630}
        sizes="(min-width: 640px) 192px, 100vw"
        src="/og.png"
        width={1200}
      />
    </div>
    <div className="flex min-w-0 flex-col gap-1 px-1 pb-1 sm:p-0">
      {meta}
      <h2 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  </Link>
);
