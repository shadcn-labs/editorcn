import { ComponentCode } from "@/components/component-code";
import { TemplateTabs } from "@/components/template-demo";
import type { TemplateName } from "@/components/template-demo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { highlightCode } from "@/lib/highlight-code";

import commentBoxItem from "../../public/r/comment-box.json";
import fullBlockEditorItem from "../../public/r/full-block-editor.json";
import fullEditorItem from "../../public/r/full-editor.json";
import simpleDocumentEditorItem from "../../public/r/simple-document-editor.json";

const ITEMS = {
  "comment-box": commentBoxItem,
  "full-block-editor": fullBlockEditorItem,
  "full-editor": fullEditorItem,
  "simple-document-editor": simpleDocumentEditorItem,
} satisfies Record<TemplateName, unknown>;

export const RegistryCode = async ({
  files,
}: {
  files: { content: string; path: string }[];
}) => {
  const highlighted = await Promise.all(
    files.map(async (file) => {
      const language = file.path.endsWith(".tsx") ? "tsx" : "ts";
      return {
        ...file,
        highlighted: await highlightCode(file.content, language),
        language,
      };
    })
  );

  return (
    <Tabs defaultValue={highlighted[0].path}>
      <TabsList className="h-auto flex-wrap justify-start">
        {highlighted.map((file) => (
          <TabsTrigger
            key={file.path}
            className="flex-none font-mono text-xs"
            value={file.path}
          >
            {file.path.split("/").pop()}
          </TabsTrigger>
        ))}
      </TabsList>
      {highlighted.map((file) => (
        <TabsContent key={file.path} className="pt-2" value={file.path}>
          <ComponentCode
            className="[&>pre]:max-h-[32rem]"
            code={file.content}
            highlightedCode={file.highlighted}
            language={file.language}
            title={file.path}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export const TemplateShowcase = ({ name }: { name: TemplateName }) => (
  <TemplateTabs code={<RegistryCode files={ITEMS[name].files} />} name={name} />
);
