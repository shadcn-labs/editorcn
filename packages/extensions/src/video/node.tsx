import { Node as TiptapNode } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { NodeView } from './node-view';

export const Node = TiptapNode.create({
    name: 'video',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: element => {
                    const value = element.getAttribute('data-src');

                    return value || null;
                },
                renderHTML: ({ src }) => {
                    if (!src) {
                        return {};
                    }

                    return { 'data-src': src };
                }
            },
            autoplay: {
                default: false,
                parseHTML: element => {
                    const value = element.getAttribute('data-autoplay');

                    return value === 'true';
                },
                renderHTML: ({ autoplay }) => {
                    return { 'data-autoplay': autoplay };
                }
            },
            controls: {
                default: true,
                parseHTML: element => {
                    const value = element.getAttribute('data-controls');

                    return value === 'true';
                },
                renderHTML: ({ controls }) => {
                    return { 'data-controls': controls };
                }
            },
            loop: {
                default: false,
                parseHTML: element => {
                    const value = element.getAttribute('data-loop');

                    return value === 'true';
                },
                renderHTML: ({ loop }) => {
                    return { 'data-loop': loop };
                }
            },
            muted: {
                default: false,
                parseHTML: element => {
                    const value = element.getAttribute('data-muted');

                    return value === 'true';
                },
                renderHTML: ({ muted }) => {
                    return { 'data-muted': muted };
                }
            },
            preload: {
                default: 'metadata',
                parseHTML: element => {
                    return element.getAttribute('data-preload') || 'metadata';
                },
                renderHTML: ({ preload }) => {
                    return { 'data-preload': preload };
                }
            },
            playsinline: {
                default: false,
                parseHTML: element => {
                    const value = element.getAttribute('data-playsinline');

                    return value === 'true';
                },
                renderHTML: ({ playsinline }) => {
                    return { 'data-playsinline': playsinline };
                }
            },
            crossOrigin: {
                default: null,
                parseHTML: element => element.getAttribute('data-crossorigin'),
                renderHTML: ({ crossOrigin }) => {
                    if (!crossOrigin) {
                        return {};
                    }

                    return { 'data-crossorigin': crossOrigin };
                }
            },
            poster: {
                default: null,
                parseHTML: element => element.getAttribute('data-poster'),
                renderHTML: ({ poster }) => {
                    if (!poster) {
                        return {};
                    }

                    return { 'data-poster': poster };
                }
            }
        };
    },
    renderHTML({ HTMLAttributes }) {
        const attrs = {
            'data-slot': 'video',
            ...HTMLAttributes
        };

        const div = document.createElement('div');
        Object.entries(attrs).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                div.setAttribute(key, value);
            }
        });

        return div;
    },
    addNodeView: () => ReactNodeViewRenderer(NodeView)
});
