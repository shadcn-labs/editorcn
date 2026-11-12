import { RiFocusMode } from '@remixicon/react';
// import { fileSize } from 'filesize';
import { FileTextIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { useControls, useTransformComponent } from 'react-zoom-pan-pinch';

import {
    Attachment,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle
} from '@/components/ui/attachment';
import { Button } from '@/components/ui/button';

import { type FileAttributes } from './types';

const A = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    const scale = useTransformComponent(({ state }) => state.scale);

    return (
        <div className="absolute top-2 right-2 z-10 flex h-[48px] items-center gap-[4px] rounded-[10px] border bg-muted/50 px-[12px] shadow-xs backdrop-blur">
            <Button
                aria-label="Zoom out"
                onClick={() => void zoomOut()}
                size="icon"
                type="button"
                variant="ghost"
            >
                <MinusIcon />
            </Button>
            <span className="min-w-8 text-center text-xs text-muted-foreground tabular-nums">
                {Math.round(scale * 100)}%
            </span>
            <Button
                aria-label="Zoom in"
                onClick={() => void zoomIn()}
                size="icon"
                type="button"
                variant="ghost"
            >
                <PlusIcon />
            </Button>
            <Button
                aria-label="Reset zoom"
                onClick={() => void resetTransform()}
                size="icon"
                type="button"
                variant="ghost"
            >
                <RiFocusMode />
            </Button>
        </div>
    );
};

export const NodeMapping = (
    attrs: FileAttributes & { uri: string | undefined }
) => {
    //

    if (attrs.type?.startsWith('audio/')) {
        return <audio src={attrs.uri} about={attrs.name || undefined} />;
    }

    if (attrs.type?.startsWith('image/')) {
        return (
            <img
                className="rounded-0 pointer-events-auto! h-auto w-full border-0 object-contain outline-custom!"
                alt={attrs.name || undefined}
                src={attrs.uri}
            />
        );
    }

    if (attrs.type?.startsWith('video/')) {
        return (
            <div className="bg-block relative isolate overflow-hidden">
                <video
                    className="aspect-video border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]"
                    about={attrs.name || undefined}
                    controls
                    src={attrs.uri}
                />
            </div>
        );
    }

    return (
        <Attachment>
            <AttachmentMedia>
                <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
                <AttachmentTitle>
                    <span className="truncate">{attrs.name}</span>
                </AttachmentTitle>
                <AttachmentDescription>
                    {attrs.type} / {attrs.size}
                </AttachmentDescription>
            </AttachmentContent>
        </Attachment>
    );
};
