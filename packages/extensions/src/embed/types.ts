export type EmbedAttributes = {
    type: 'audio' | 'image' | 'youtube' | 'video';
    uri: string | null;
};

export interface EmbedOptions {
    HTMLAttributes: Record<string, any>;
    // TODO: types: ('audio' | 'image' | 'youtube' | 'video')[];
}
