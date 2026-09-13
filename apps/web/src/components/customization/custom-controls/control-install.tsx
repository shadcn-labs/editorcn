"use client";

import type { BundledLanguage } from "@editorcn/ui/components/kibo-ui/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockItem,
} from "@editorcn/ui/components/kibo-ui/code-block";

import { absoluteUrl } from "@/lib/utils";

export interface ControlInstallProps {
  slug: string;
}

export const ControlInstall = ({ slug }: ControlInstallProps) => {
  const command = `npx shadcn@latest add "${absoluteUrl(`/r/custom-controls-${slug}`)}"`;

  return (
    <CodeBlock
      data={[{ code: command, filename: "sh", language: "bash" }]}
      defaultValue="bash"
    >
      <CodeBlockCopyButton className="absolute top-3 right-3 z-10" />
      <CodeBlockBody>
        {(item) => (
          <CodeBlockItem key={item.language} value={item.language}>
            <CodeBlockContent language={item.language as BundledLanguage}>
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
};
