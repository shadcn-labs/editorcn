import { mergeAttributes } from '@tiptap/core';
import { Node as _Node } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { NodeView } from './node-view';
import { type PlantUMLAttributes, type PlantUMLOptions } from './types';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        plantuml: {
            setPlantUML: (value: PlantUMLAttributes) => ReturnType;
        };
    }
}

export const Node = _Node.create<PlantUMLOptions>({
    name: 'plantuml',
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
                tag: 'div[data-slot="plantuml"]'
            }
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-slot': 'plantuml'
            })
        ];
    },
    addNodeView() {
        return ReactNodeViewRenderer(NodeView);
    },
    addCommands() {
        return {
            setPlantUML:
                value =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: value
                    })
        };
    }
});
