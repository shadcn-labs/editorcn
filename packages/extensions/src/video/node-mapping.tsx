import { NodeViewWrapper } from '@tiptap/react';
import { type MediaHTMLAttributes } from 'react';

export const NodeMapping = ({
    src,
    autoPlay,
    controls,
    loop,
    muted,
    preload,
    playsInline,
    crossOrigin,
    poster
}: {
    src?: string;
    autoPlay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: 'metadata' | 'none' | 'auto';
    playsInline?: boolean;
    crossOrigin?: 'anonymous' | 'use-credentials' | null;
    poster?: string;
}) => {
    //

    return (
        <NodeViewWrapper data-slot="video">
            <div className="relative isolate w-full overflow-hidden bg-black">
                <video
                    className="aspect-video w-full"
                    src={src}
                    autoPlay={autoPlay}
                    controls={controls}
                    loop={loop}
                    muted={muted}
                    preload={preload}
                    playsInline={playsInline}
                    crossOrigin={
                        crossOrigin as MediaHTMLAttributes<'video'>['crossOrigin']
                    }
                    poster={poster}
                />
            </div>
        </NodeViewWrapper>
    );
};
