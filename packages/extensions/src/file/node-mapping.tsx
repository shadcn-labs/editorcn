import { FileTextIcon } from 'lucide-react';

import {
    Attachment,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle
} from '@editorcn/ui/components/attachment';

import { type FileAttributes } from './types';

export const NodeMapping = (
    attrs: FileAttributes & { getUrl: string | undefined }
) => {
    //

    if (attrs.type?.startsWith('audio/')) {
        return <audio src={attrs.getUrl} about={attrs.name || undefined} />;
    }

    if (attrs.type?.startsWith('image/')) {
        return (
            <img
                className="rounded-0 border-0 object-contain outline-custom!"
                alt={attrs.name || undefined}
                src={attrs.getUrl}
            />
        );
    }

    if (attrs.type?.startsWith('video/')) {
        return (
            <video
                className="aspect-video border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]"
                about={attrs.name || undefined}
                controls
                src={attrs.getUrl}
            />
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
