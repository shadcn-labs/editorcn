import { type Range, mergeAttributes } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';
import { Node as _Node } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { v7 } from 'uuid';
import z from 'zod';

import { NodeView } from './node-view';
import { type FileAttributes, type FileOptions } from './types';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        file: {
            setFileA: (
                value: Partial<FileAttributes> & { id: string | null }
            ) => ReturnType;
            setFileB: (value: File, position?: number | Range) => ReturnType;
        };
    }
}

export const Node = _Node.create<FileOptions>({
    name: 'file',
    group: 'block',
    atom: true,
    addOptions() {
        return {
            HTMLAttributes: {},
            //
            uri: () => undefined,
            onSubmit: () => Promise.reject('Lorem'),
            onError: (value, ipsum) => console.error(value, ipsum),
            //
            accept: [],
            minFileSize: 0,
            maxFileSize: Infinity
        };
    },
    addAttributes() {
        return {
            uuid: { default: null, rendered: false },
            //
            id: {
                default: null,
                isRequired: true,
                parseHTML: element => element.getAttribute('data-id'),
                renderHTML: ({ id }) => ({
                    'data-id': id
                })
            },
            name: {
                default: null,
                isRequired: false,
                parseHTML: element => element.getAttribute('data-name'),
                renderHTML: ({ name }) => ({
                    'data-name': name
                })
            },
            type: {
                default: null,
                isRequired: false,
                parseHTML: element => element.getAttribute('data-type'),
                renderHTML: ({ type }) => ({
                    'data-type': type
                })
            },
            size: {
                default: null,
                isRequired: false,
                parseHTML: element => {
                    const value = element.getAttribute('data-size');

                    return value ? Number(value) : null;
                },
                renderHTML: ({ size }) => ({
                    'data-size': size
                })
            }
        };
    },
    parseHTML() {
        return [
            {
                tag: 'div[data-slot="file"]'
            }
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-slot': 'file'
            })
        ];
    },
    addNodeView() {
        return ReactNodeViewRenderer(NodeView);
    },
    addCommands() {
        return {
            setFileA:
                value =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: value
                    }),
            setFileB:
                (value, position) =>
                ({ commands }) => {
                    const { error } = z
                        .file()
                        .mime(this.options.accept)
                        .min(this.options.minFileSize)
                        .max(this.options.maxFileSize)
                        .safeParse(value);

                    if (error) {
                        this.options.onError(value, new Error(error.message));

                        return false;
                    }

                    const uuid = v7();

                    this.storage.queue.set(uuid, value);

                    const _ = {
                        type: this.name,
                        attrs: {
                            uuid: uuid,
                            //
                            id: null,
                            name: value.name,
                            size: value.size,
                            type: value.type
                        }
                    };

                    return position === undefined
                        ? commands.insertContent(_)
                        : commands.insertContentAt(position, _);
                }
        };
    },
    addStorage() {
        return { queue: new Map<string, File>() };
    },
    addExtensions() {
        return [
            FileHandler.configure({
                allowedMimeTypes: this.options.accept,
                consumePasteEvent: true,
                onDrop: (editor, files, position) => {
                    files.forEach(value =>
                        editor.chain().focus().setFileB(value, position).run()
                    );
                },
                onPaste: (editor, files, html) => {
                    // The plugin ignores this return value. When the clipboard also carries
                    // html (copying from a web page), skip the files and let the html paste.
                    if (html) {
                        return;
                    }

                    files.forEach(value =>
                        editor.chain().focus().setFileB(value).run()
                    );
                }
            })
        ];
    }
});
