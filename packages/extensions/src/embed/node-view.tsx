import { RiFileLine, RiImageLine, RiYoutubeLine } from '@remixicon/react';
import { type ReactNodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import {
    AlertCircleIcon,
    AudioLinesIcon,
    LinkIcon,
    VideoIcon,
    XIcon
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { type EmbedAttributes } from './types';

const urlSchema = z.string().trim().url('Introduza um endereço URL válido');

export const NodeView = ({
    node,
    getPos,
    editor,
    updateAttributes,
    deleteNode
}: ReactNodeViewProps) => {
    const attrs = node!.attrs as EmbedAttributes;

    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const replace = useCallback(
        (src: string) => {
            const pos = getPos();

            if (typeof pos !== 'number') {
                return;
            }

            updateAttributes({ uri: src });

            editor
                .chain()
                .focus()
                .insertContentAt(
                    { from: pos, to: pos + node.nodeSize },
                    { attrs: { src }, type: attrs.type }
                )
                .run();
        },
        [attrs.type, editor, getPos, node.nodeSize, updateAttributes]
    );

    const config = useMemo(() => {
        switch (attrs.type) {
            case 'audio':
                return {
                    Icon: AudioLinesIcon,
                    title: 'Incorporar áudio',
                    description:
                        'Introduza o endereço URL do ficheiro de áudio para reprodução.',
                    placeholder: 'https://exemplo.com/audio.mp3'
                };
            case 'video':
                return {
                    Icon: VideoIcon,
                    title: 'Incorporar vídeo',
                    description:
                        'Introduza o endereço URL do ficheiro de vídeo.',
                    placeholder: 'https://exemplo.com/video.mp4'
                };
            case 'youtube':
                return {
                    Icon: RiYoutubeLine,
                    title: 'Incorporar YouTube',
                    description: 'Introduza a ligação do vídeo do YouTube.',
                    placeholder: 'https://www.youtube.com/watch?v=...'
                };
            case 'image':
                return {
                    Icon: RiImageLine,
                    title: 'Incorporar imagem',
                    description: 'Introduza o endereço URL da imagem na web.',
                    placeholder: 'https://exemplo.com/imagem.png'
                };
            default:
                return {
                    Icon: RiFileLine,
                    title: 'Incorporar ligação',
                    description:
                        'Introduza o endereço URL para incorporar conteúdo.',
                    placeholder: 'https://...'
                };
        }
    }, [attrs.type]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            const result = urlSchema.safeParse(url);

            if (!result.success) {
                setError(result.error.issues[0]?.message ?? 'URL inválido');

                return;
            }

            setError(null);
            setOpen(false);
            replace(result.data);
        },
        [replace, url]
    );

    const handleCancel = useCallback(() => {
        setOpen(false);
        setError(null);
        setUrl('');
    }, []);

    const handleDelete = useCallback(() => {
        setOpen(false);

        if (deleteNode) {
            deleteNode();
        }
    }, [deleteNode]);

    if (editor.isEditable === false) {
        return null;
    }

    const { Icon } = config;

    return (
        <NodeViewWrapper
            data-slot="media-placeholder"
            data-type={attrs.type}
            data-uri={attrs.uri}
        >
            <div className="p-px">
                <Popover open={open} onOpenChange={setOpen}>
                    <div className="group relative flex w-full items-center justify-between rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/15 p-3 transition-all hover:border-primary/50 hover:bg-muted/30">
                        <PopoverTrigger className="flex flex-1 cursor-pointer items-center gap-3 text-left outline-none">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-all group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary">
                                <Icon className="size-5" />
                            </div>

                            <div className="flex min-w-0 flex-col">
                                <span className="text-sm font-medium text-foreground">
                                    {config.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Clique para introduzir a ligação
                                </span>
                            </div>
                        </PopoverTrigger>

                        {deleteNode ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                                title="Cancelar e remover bloco"
                            >
                                <XIcon className="size-4" />
                            </Button>
                        ) : null}
                    </div>

                    <PopoverContent
                        align="start"
                        sideOffset={8}
                        className="w-88 sm:w-96"
                    >
                        <PopoverHeader>
                            <PopoverTitle className="flex items-center gap-2">
                                <Icon className="size-4 text-primary" />
                                <span>{config.title}</span>
                            </PopoverTitle>
                            <PopoverDescription>
                                {config.description}
                            </PopoverDescription>
                        </PopoverHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-2 flex flex-col gap-3"
                        >
                            <div className="space-y-1">
                                <Input
                                    type="url"
                                    name="value"
                                    value={url}
                                    onChange={e => {
                                        setUrl(e.target.value);

                                        if (error) {
                                            setError(null);
                                        }
                                    }}
                                    placeholder={config.placeholder}
                                    autoFocus
                                    className={cn(
                                        error &&
                                            'border-destructive focus-visible:ring-destructive/30'
                                    )}
                                    aria-invalid={Boolean(error)}
                                />

                                {error ? (
                                    <div className="flex items-center gap-1.5 pt-0.5 text-xs text-destructive">
                                        <AlertCircleIcon className="size-3.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                {deleteNode ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        Remover
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancel}
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="gap-1.5"
                                    >
                                        <LinkIcon className="size-3.5" />
                                        Incorporar
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </PopoverContent>
                </Popover>
            </div>
        </NodeViewWrapper>
    );
};
