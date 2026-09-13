import manifest from "@editorcn/custom-controls/manifest.json";
import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { absoluteUrl } from "@/lib/utils";

interface ManifestControl {
  title: string;
  description: string;
  file: string;
  ui: string[];
}

const CONTROLS = manifest as unknown as Record<string, ManifestControl>;

export const ControlList = () => (
  <div className="grid gap-4">
    {Object.entries(CONTROLS).map(([slug, meta]) => {
      const command = `npx shadcn@latest add "${absoluteUrl(`/r/custom-controls-${slug}`)}"`;
      return (
        <Card key={slug} className="rounded-xl py-4 shadow-none">
          <CardHeader className="px-4">
            <CardTitle className="text-base font-medium">
              <Link
                className="hover:underline"
                href={`/docs/custom-controls/${slug}`}
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
