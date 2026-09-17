import manifest from "@editorcn/extensions/manifest.json";
import Link from "next/link";

interface ManifestExtension {
  title: string;
  description: string;
}

const EXTENSIONS = manifest as unknown as Record<string, ManifestExtension>;

export const ExtensionList = () => (
  <div className="grid gap-2 text-sm sm:grid-cols-2">
    {Object.entries(EXTENSIONS).map(([slug, meta]) => (
      <Link
        key={slug}
        className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        href={`/docs/extensions/${slug}`}
      >
        {meta.title}
      </Link>
    ))}
  </div>
);
