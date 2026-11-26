"use client";

import { RichTextEditor } from "@editorcn/editor";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockItem,
} from "@editorcn/ui/components/kibo-ui/code-block";
import type { BundledLanguage } from "@editorcn/ui/components/kibo-ui/code-block";
import { Extension } from "@tiptap/core";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import TipTapLink from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import "@editorcn/editor/style.css";

const SAMPLE = `
<h2>Try it out</h2>
<p>Select some text and use the control in the toolbar above.</p>
`.trim();

const FontSize = Extension.create({
  addGlobalAttributes() {
    return [
      {
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
        types: ["textStyle"],
      },
    ];
  },

  name: "fontSize",
});

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    link: false,
    underline: false,
  }),
  Underline,
  TipTapLink.configure({
    openOnClick: true,
  }),
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({ placeholder: "Type something..." }),
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TextStyle,
  FontFamily,
  FontSize,
];

export const TemplateCard = ({
  children,
  code,
}: {
  children: React.ReactNode;
  code: string;
}) => {
  const editor = useEditor({
    content: SAMPLE,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="pt-4">
        <div>
          <RichTextEditor editor={editor}>
            <style>{`
              .rte-content table {
                border-collapse: collapse;
                table-layout: fixed;
                width: 100%;
                margin: 0;
                overflow: hidden;
              }
              .rte-content td, .rte-content th {
                border: 1px solid var(--border);
                padding: 0.5rem 0.75rem;
                vertical-align: top;
                text-align: left;
                min-width: 80px;
                position: relative;
              }
              .rte-content th {
                background: var(--muted);
                font-weight: 600;
              }
              .rte-content .selectedCell {
                background: var(--accent);
              }
            `}</style>
            <RichTextEditor.Toolbar>
              <RichTextEditor.ControlsGroup>
                {children}
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            <RichTextEditor.Content />
          </RichTextEditor>
        </div>
      </TabsContent>
      <TabsContent value="code" className="pt-4">
        <div className="relative">
          <CodeBlock
            data={[{ code, filename: "control.tsx", language: "tsx" }]}
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
        </div>
      </TabsContent>
    </Tabs>
  );
};
