import { ComponentCode } from "@/components/component-code";
import { TemplateTabs } from "@/components/template-demo";
import type { TemplateName } from "@/components/template-demo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { highlightCode } from "@/lib/highlight-code";

import commentBoxItem from "../../public/r/comment-box.json";
import simpleDocumentEditorItem from "../../public/r/simple-document-editor.json";

const ITEMS = {
  "comment-box": commentBoxItem,
  "simple-document-editor": simpleDocumentEditorItem,
} satisfies Record<TemplateName, unknown>;

export const TemplateShowcase = async ({ name }: { name: TemplateName }) => {
  const files = await Promise.all(
    ITEMS[name].files.map(async (file) => {
      const language = file.path.endsWith(".tsx") ? "tsx" : "ts";
      return {
        ...file,
        highlighted: await highlightCode(file.content, language),
        language,
      };
    })
  );

  return (
    <TemplateTabs
      code={
        <Tabs defaultValue={files[0].path}>
          <TabsList className="h-auto flex-wrap justify-start">
            {files.map((file) => (
              <TabsTrigger
                key={file.path}
                className="flex-none font-mono text-xs"
                value={file.path}
              >
                {file.path.split("/").pop()}
              </TabsTrigger>
            ))}
          </TabsList>
          {files.map((file) => (
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
      }
      name={name}
    />
  );
};
