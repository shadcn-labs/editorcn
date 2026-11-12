import { useMutation } from '@tanstack/react-query';
import { type ReactNodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { filesize } from 'filesize';
import {
    AlertCircleIcon,
    FileIcon,
    RotateCwIcon,
    UploadCloudIcon
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v7 } from 'uuid';
import { z } from 'zod';

import { Button } from '@editorcn/ui/components/button';
import { Progress } from '@editorcn/ui/components/progress';
import { cn } from '@editorcn/ui/lib/utils';

import { NodeMapping } from './node-mapping';
import {
    type FileAttributes,
    type FileOptions,
    type FileStorage
} from './types';

export const NodeView = ({
    extension,
    node,
    updateAttributes,
    deleteNode
}: Partial<ReactNodeViewProps<FileAttributes>>) => {
    const attrs = node!.attrs as FileAttributes;
    const options = extension!.options as FileOptions;
    const storage = extension!.storage as FileStorage;

    const [progress, setProgress] = useState(0);
    const controller = useRef<AbortController | null>(null);

    const handleFile = useCallback(
        (targetFile: File) => {
            const { error } = z
                .file()
                .mime(options.accept)
                .min(options.minFileSize)
                .max(options.maxFileSize)
                .safeParse(targetFile);

            if (error) {
                options.onError(targetFile, new Error(error.message));

                return;
            }

            const uuid = v7();

            storage.queue.set(uuid, targetFile);

            if (updateAttributes) {
                updateAttributes({
                    uuid,
                    name: targetFile.name,
                    size: targetFile.size,
                    type: targetFile.type
                });
            }
        },
        [options, storage.queue, updateAttributes]
    );

    const acceptConfig = useMemo(() => {
        if (!options.accept || options.accept.length === 0) {
            return undefined;
        }

        return options.accept.reduce<Record<string, string[]>>((acc, mime) => {
            acc[mime] = [];

            return acc;
        }, {});
    }, [options.accept]);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        open: openFilePicker
    } = useDropzone({
        onDrop: acceptedFiles => {
            if (!acceptedFiles || acceptedFiles.length === 0) {
                return;
            }

            handleFile(acceptedFiles[0]);
        },
        onDropRejected: fileRejections => {
            const first = fileRejections[0];

            if (first) {
                const message = first.errors.map(e => e.message).join(', ');

                options.onError(first.file, new Error(message));
            }
        },
        accept: acceptConfig,
        minSize: options.minFileSize > 0 ? options.minFileSize : undefined,
        maxSize:
            Number.isFinite(options.maxFileSize) && options.maxFileSize > 0
                ? options.maxFileSize
                : undefined,
        multiple: false,
        noClick: false
    });

    const upload = useMutation({
        mutationFn: (target: File) => {
            controller.current = new AbortController();

            setProgress(0);

            return options.onSubmit(
                target,
                controller.current.signal,
                setProgress
            );
        },
        onSuccess: value => {
            if (attrs.uuid) {
                storage.queue.delete(attrs.uuid);
            }

            if (updateAttributes) {
                updateAttributes({ ...value, uuid: null });
            }
        },
        onError: (error, targetFile) => {
            options.onError(targetFile, error as Error);
        }
    });

    const {
        mutate: uploadMutate,
        isError: uploadIsError,
        isPending: uploadIsPending,
        error: uploadError
    } = upload;

    const remove = useCallback(() => {
        controller.current?.abort();

        if (attrs.uuid) {
            storage.queue.delete(attrs.uuid);
        }

        if (deleteNode) {
            deleteNode();
        }
    }, [attrs.uuid, deleteNode, storage.queue]);

    const file =
        attrs.uuid === null ? undefined : storage.queue.get(attrs.uuid);

    const started = useRef(false);
    useEffect(() => {
        if (attrs.id === null && file && !started.current) {
            started.current = true;
            uploadMutate(file);
        }
    }, [attrs.id, file, uploadMutate]);

    const children = useMemo(() => {
        if (file) {
            return (
                <div
                    className={cn(
                        'relative flex flex-col gap-3 rounded-xl border p-4 shadow-xs transition-all',
                        uploadIsError
                            ? 'border-destructive/40 bg-destructive/5'
                            : 'border-border bg-card'
                    )}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className={cn(
                                    'flex size-10 shrink-0 items-center justify-center rounded-lg',
                                    uploadIsError
                                        ? 'bg-destructive/10 text-destructive'
                                        : 'bg-muted text-foreground'
                                )}
                            >
                                {uploadIsError ? (
                                    <AlertCircleIcon className="size-5" />
                                ) : (
                                    <FileIcon className="size-5" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm leading-none font-medium text-foreground">
                                    {attrs.name ?? file.name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {typeof (attrs.size ?? file.size) ===
                                    'number'
                                        ? filesize(attrs.size ?? file.size)
                                        : null}
                                    {uploadIsPending &&
                                        !uploadIsError &&
                                        ` • ${Math.round(progress)}%`}
                                    {uploadIsError &&
                                        ' • Falha no carregamento'}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            {uploadIsError ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => uploadMutate(file)}
                                    className="gap-1.5"
                                >
                                    <RotateCwIcon className="size-3.5" />
                                    Tentar novamente
                                </Button>
                            ) : null}

                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className={
                                    uploadIsError
                                        ? 'text-destructive hover:bg-destructive/10'
                                        : 'text-muted-foreground hover:text-foreground'
                                }
                                onClick={remove}
                            >
                                {uploadIsError ? 'Remover' : 'Cancelar'}
                            </Button>
                        </div>
                    </div>

                    {!uploadIsError ? (
                        <div className="space-y-1">
                            <Progress
                                value={progress}
                                className="h-1.5 w-full"
                            />
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>A carregar ficheiro...</span>
                                <span className="font-medium tabular-nums">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {uploadIsError && uploadError instanceof Error ? (
                        <p className="text-xs text-destructive">
                            {uploadError.message ||
                                'Ocorreu um erro ao carregar o ficheiro.'}
                        </p>
                    ) : null}
                </div>
            );
        }

        if (attrs.id === null || attrs.id.trim().length === 0) {
            return (
                <div
                    {...getRootProps()}
                    className={cn(
                        'group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all select-none',
                        'border-muted-foreground/25 bg-muted/15 hover:border-primary/50 hover:bg-muted/30',
                        isDragActive &&
                            !isDragReject &&
                            'border-primary bg-primary/5 ring-4 ring-primary/10',
                        isDragReject &&
                            'border-destructive bg-destructive/5 ring-4 ring-destructive/10'
                    )}
                >
                    <input {...getInputProps()} />

                    <div
                        className={cn(
                            'flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200',
                            'group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary',
                            isDragActive &&
                                !isDragReject &&
                                'scale-110 bg-primary/10 text-primary',
                            isDragReject && 'bg-destructive/10 text-destructive'
                        )}
                    >
                        {isDragReject ? (
                            <AlertCircleIcon className="size-6" />
                        ) : (
                            <UploadCloudIcon className="size-6" />
                        )}
                    </div>

                    <div className="flex flex-col gap-1 text-balance">
                        <p className="text-sm font-medium text-foreground">
                            {isDragReject
                                ? 'Tipo de ficheiro não suportado'
                                : isDragActive
                                  ? 'Solte o ficheiro para iniciar o carregamento'
                                  : 'Arraste e solte o ficheiro aqui, ou clique para seleccionar'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {Number.isFinite(options.maxFileSize) &&
                            options.maxFileSize > 0
                                ? `Tamanho máximo: ${filesize(options.maxFileSize)}`
                                : 'Suporta documentos, imagens e outros ficheiros multimédia'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={e => {
                                e.stopPropagation();
                                openFilePicker();
                            }}
                        >
                            Seleccionar ficheiro
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={e => {
                                e.stopPropagation();
                                remove();
                            }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            );
        }

        return <NodeMapping getUrl={options.getUrl(attrs)} {...attrs} />;
    }, [
        attrs,
        file,
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        openFilePicker,
        options,
        progress,
        remove,
        uploadError,
        uploadIsError,
        uploadIsPending,
        uploadMutate
    ]);

    return (
        <NodeViewWrapper
            data-slot="file"
            data-id={attrs.id}
            data-name={attrs.name}
            data-type={attrs.type}
            data-size={attrs.size}
        >
            <div className="p-px">{children}</div>
        </NodeViewWrapper>
    );
};
