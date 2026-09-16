import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";

export type BlockEditorLabels = {
  paragraphLabel?: string;
    headingLabel?: string;
      bulletListLabel?: string;
        orderedListLabel?: string;
          taskListLabel?: string;
            blockquoteLabel?: string;
              codeBlockLabel?: string;
                dividerLabel?: string;
                };

                export type BlockEditorIcons = {
                  dragHandleIcon?: ReactNode;
                  };

                  export interface AiConfig {
                    provider: 'openai' | 'anthropic' | 'google' | string;
                      apiKey: string;
                        model?: string;
                        }

                        export interface BlockEditorProps {
                          editor: Editor | null;
                            children?: ReactNode;
                              className?: string;
                                labels?: Partial<BlockEditorLabels>;
                                  icons?: Partial<BlockEditorIcons>;
                                    aiConfig?: AiConfig; // إضافة خاصية الذكاء الاصطناعي الجديدة هنا
                                    }

                                    export interface BlockEditorContextVal {
                                      editor: Editor | null;
                                        labels: BlockEditorLabels;
                                          icons: BlockEditorIcons;
                                            aiConfig?: AiConfig; // تمريرها عبر الـ Context لـ الـ Slash Command
                                            }
                                            