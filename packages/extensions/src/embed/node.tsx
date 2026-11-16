import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, Node as _Node } from '@tiptap/react';

import { NodeView } from './node-view';
import { type EmbedAttributes } from './types';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        embed: {
            setEmbed: (type: EmbedAttributes['type']) => ReturnType;
        };
    }
}

export const Node = _Node.create({
    name: 'embed',
    group: 'block',
    atom: true,
    addOptions() {
        return {
            HTMLAttributes: {}
            // TODO: types: ['audio', 'image', 'video', 'youtube']
        };
    },
    addAttributes() {
        return {
            type: {
                isRequired: true,
                default: null,
                parseHTML: element => {
                    const value = element.getAttribute('data-type');

                    return value || null;
                },
                renderHTML: ({ type }) => {
                    if (!type) {
                        return {};
                    }

                    return { 'data-type': type };
                }
            },
            uri: {
                default: null,
                parseHTML: element => {
                    const value = element.getAttribute('data-uri');

                    return value || null;
                },
                renderHTML: ({ uri }) => {
                    if (!uri) {
                        return {};
                    }

                    return { 'data-uri': uri };
                }
            }
        };
    },
    parseHTML() {
        return [
            {
                tag: 'div[data-slot="media-placeholder"]'
            }
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-slot': 'embed'
            })
        ];
    },
    addNodeView: () => ReactNodeViewRenderer(NodeView),
    addCommands() {
        return {
            setEmbed:
                type =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: {
                            type
                        }
                    })
        };
    }
});
