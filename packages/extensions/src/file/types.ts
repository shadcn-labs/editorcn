import { type z } from 'zod';

export type FileAttributes = {
    uuid: string | null;
    //
    id: string | null;
    name: string | null;
    size: number | null;
    type: string | null;
};

export interface FileOptions {
    HTMLAttributes: Record<string, any>;
    uri: (file: FileAttributes) => string | undefined;
    onSubmit: (
        file: File,
        signal: AbortSignal,
        /**
         * from 0 to 100
         */
        onProgress: (percent: number) => void
    ) => Promise<Omit<FileAttributes, 'uuid'>>;
    onError: (file: File, error: Error) => void;
    //
    accept: z.core.util.MimeTypes[];
    minFileSize: number;
    /**
     * in bytes
     */
    maxFileSize: number;
}

export type FileStorage = {
    /** Files waiting for (or in) upload, keyed by the node's `uuid` attribute. */
    queue: Map<string, File>;
};
