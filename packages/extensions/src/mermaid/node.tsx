import { mergeAttributes } from '@tiptap/core';
import { Node as _Node } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { NodeView } from './node-view';
import { type MermaidAttributes, type MermaidOptions } from './types';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mermaid: {
            setMermaid: (value: MermaidAttributes) => ReturnType;
        };
    }
}

export const Node = _Node.create<MermaidOptions>({
    name: 'mermaid',
    group: 'block',
    atom: true,
    addOptions() {
        return {
            HTMLAttributes: {}
        };
    },
    addAttributes() {
        return {
            value: {
                default: null,
                isRequired: true,
                parseHTML: element => element.getAttribute('data-value'),
                renderHTML: ({ value }) => ({
                    'data-value': value
                })
            }
        };
    },
    parseHTML() {
        return [
            {
                tag: 'div[data-slot="mermaid"]'
            }
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-slot': 'mermaid'
            })
        ];
    },
    addNodeView() {
        return ReactNodeViewRenderer(NodeView);
    },
    addCommands() {
        return {
            setMermaid:
                value =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: value
                    })
        };
    }
});
