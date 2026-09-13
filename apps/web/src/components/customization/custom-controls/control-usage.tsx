"use client";

import type { BundledLanguage } from "@editorcn/ui/components/kibo-ui/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockItem,
} from "@editorcn/ui/components/kibo-ui/code-block";

import { CUSTOM_CONTROL_USAGE } from "./usage";

export interface ControlUsageProps {
  slug: string;
  editor: "toolbar" | "block";
}

export const ControlUsage = ({ slug, editor }: ControlUsageProps) => {
  const usage = CUSTOM_CONTROL_USAGE[slug];
  const code = usage?.[editor];
  if (!code) {
    return null;
  }

  return (
    <CodeBlock
      data={[
        {
          code,
          filename: editor === "block" ? "block-editor.tsx" : "editor.tsx",
          language: "tsx",
        },
      ]}
      defaultValue="tsx"
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
