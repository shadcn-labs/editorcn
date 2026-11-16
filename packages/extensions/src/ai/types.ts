export type AiMode = "replace" | "insert";

export type AiStatus = "idle" | "streaming" | "done" | "error";

/**
 * What the extension sends to your transport. Text fields are markdown when
 * the Markdown extension is installed, plain text otherwise.
 */
export interface AiRequest {
  /** The instruction, typed by the user or taken from a preset. */
  prompt: string;
  /** `replace` swaps the selection, `insert` adds content below it. */
  mode: AiMode;
  /** The selected content. Empty when nothing is selected. */
  selection: string;
  /** Content before the selection or cursor, trimmed to `contextLimit`. */
  before: string;
  /** Content after the selection or cursor, trimmed to `contextLimit`. */
  after: string;
  /** Preset id, when the request came from a preset. */
  task?: string;
  system?: string;
  /** Extra values passed through to your transport untouched. */
  data?: Record<string, unknown>;
}

export type AiStreamSource =
  | string
  | AsyncIterable<string>
  | ReadableStream<string | Uint8Array>;

export type AiTransport = (
  request: AiRequest,
  options: { signal: AbortSignal }
) => AiStreamSource | Promise<AiStreamSource>;

export interface AiSubmitOptions {
  prompt: string;
  /** Defaults to `replace` with a selection and `insert` without one. */
  mode?: AiMode;
  task?: string;
  /** Overrides the extension's `system` option for this request. */
  system?: string;
  data?: Record<string, unknown>;
}

export interface AiState {
  status: AiStatus;
  mode: AiMode;
  /** Start of the range the result replaces on accept. */
  from: number;
  /** End of that range. Equal to `from` when inserting. */
  to: number;
  /** The response streamed so far. */
  text: string;
  error: string | null;
  request: AiRequest | null;
}

export interface AiPreset {
  id: string;
  label: string;
  group: string;
  prompt: string;
  mode?: AiMode;
}
