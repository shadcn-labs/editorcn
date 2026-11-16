import { type ReactNodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';

import { NodeMapping } from './node-mapping';

export const NodeView = ({ node }: ReactNodeViewProps) => {
    const value = node!.attrs as {
        src: string | null;
        autoplay: boolean;
        controls: boolean;
        loop: boolean;
        muted: boolean;
        preload: 'metadata' | 'none' | 'auto';
        playsinline: boolean;
        crossOrigin: 'anonymous' | 'use-credentials' | null;
        poster: string | null;
    };

    return (
        <NodeViewWrapper
            // data-slot="video"
            data-src={value.src}
            data-autoplay={value.autoplay}
            data-controls={value.controls}
            data-loop={value.loop}
            data-muted={value.muted}
            data-preload={value.preload}
            data-playsinline={value.playsinline}
            data-crossorigin={value.crossOrigin}
            data-poster={value.poster}
        >
            <div className="p-px">
                <NodeMapping
                    src={value.src || undefined}
                    autoPlay={value.autoplay}
                    controls={value.controls}
                    loop={value.loop}
                    muted={value.muted}
                    preload={value.preload}
                    playsInline={value.playsinline}
                    crossOrigin={value.crossOrigin}
                    poster={value.poster || undefined}
                />
            </div>
        </NodeViewWrapper>
    );
};
