import { RiOrganizationChart } from '@remixicon/react';
import { type ReactNodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import {
    CheckIcon,
    Code2Icon,
    CopyIcon,
    EyeIcon,
    Trash2Icon
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { NodeMapping } from './node-mapping';
import { type MermaidAttributes } from './types';

const _ = `classDiagram
Class01 <|-- AveryLongClass : Cool
Class03 _-- Class04
Class05 o-- Class06
Class07 .. Class08
Class09 --> C2 : Where am i?
Class09 --_ C3
Class09 --|> Class07
Class07 : equals()
Class07 : Object[] elementData
Class01 : size()
Class01 : int chimp
Class01 : int gorilla
Class08 <--> C2: Cool label
`;

export const NodeView = ({
    node,
    updateAttributes,
    deleteNode
}: Partial<ReactNodeViewProps<MermaidAttributes>>) => {
    const attrs = node!.attrs as MermaidAttributes;
    const [copied, setCopied] = useState(false);

    const currentValue = attrs.value ?? _;

    const handleCopy = useCallback(() => {
        if (!currentValue) {
            return;
        }

        void navigator.clipboard.writeText(currentValue);
        setCopied(true);

        const timeout = setTimeout(() => {
            setCopied(false);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [currentValue]);

    return (
        <NodeViewWrapper data-slot="mermaid" data-value={attrs.value}>
            <div className="p-px">
                <Tabs
                    defaultValue="preview"
                    className="gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-xs"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <RiOrganizationChart className="size-4 text-primary" />
                                <span>Mermaid</span>
                            </div>

                            <TabsList className="h-7 bg-muted/80 p-0.5">
                                <TabsTrigger
                                    value="preview"
                                    className="h-6 gap-1.5 px-2.5 text-xs"
                                >
                                    <EyeIcon className="size-3.5" />
                                    <span>Pré-visualização</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="code"
                                    className="h-6 gap-1.5 px-2.5 text-xs"
                                >
                                    <Code2Icon className="size-3.5" />
                                    <span>Código</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={handleCopy}
                                title="Copiar código Mermaid"
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            Copiado
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon className="size-3.5" />
                                        <span>Copiar</span>
                                    </>
                                )}
                            </Button>

                            {deleteNode ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={deleteNode}
                                    title="Remover diagrama"
                                >
                                    <Trash2Icon className="size-3.5" />
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <TabsContent
                        value="preview"
                        className="m-0 min-h-[260px] bg-card p-0"
                    >
                        <NodeMapping {...attrs} />
                    </TabsContent>

                    <TabsContent value="code" className="m-0 p-0">
                        <textarea
                            className="min-h-[260px] w-full resize-y border-0 bg-muted/20 p-4 font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:ring-0"
                            value={currentValue}
                            placeholder="Escreva o diagrama Mermaid aqui..."
                            spellCheck={false}
                            onChange={e => {
                                if (updateAttributes) {
                                    updateAttributes({
                                        value: e.currentTarget.value
                                    });
                                }
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </NodeViewWrapper>
    );
};
