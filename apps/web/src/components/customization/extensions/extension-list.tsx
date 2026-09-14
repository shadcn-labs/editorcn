import manifest from "@editorcn/extensions/manifest.json";
import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { absoluteUrl } from "@/lib/utils";

interface ManifestExtension {
  title: string;
  description: string;
}

const EXTENSIONS = manifest as unknown as Record<string, ManifestExtension>;

export const ExtensionList = () => (
  <div className="grid gap-4">
    {Object.entries(EXTENSIONS).map(([slug, meta]) => {
      const command = `npx shadcn@latest add "${absoluteUrl(`/r/${slug}.json`)}"`;
      return (
        <Card key={slug} className="rounded-xl py-4 shadow-none">
          <CardHeader className="px-4">
            <CardTitle className="text-base font-medium">
              <Link
                className="hover:underline"
                href={`/docs/extensions/${slug}`}
              >
                {meta.title}
              </Link>
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {meta.description}
            </p>
          </CardHeader>
          <CardContent className="flex items-center gap-2 px-4">
            <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-1.5 font-mono text-xs">
              {command}
            </code>
            <CopyButton showTooltip={false} value={command}>
              Copy
            </CopyButton>
          </CardContent>
        </Card>
      );
    })}
  </div>
);