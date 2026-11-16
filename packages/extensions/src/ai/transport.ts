import type { AiRequest, AiStreamSource, AiTransport } from "./types";

export interface FetchTransportOptions {
  /** Your route, for example `/api/ai`. */
  api: string;
  headers?: HeadersInit | (() => HeadersInit);
  /** Extra JSON merged into the request body, such as a model id. */
  body?:
    | Record<string, unknown>
    | ((request: AiRequest) => Record<string, unknown>);
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
}

const isReadableStream = (
  value: unknown
): value is ReadableStream<string | Uint8Array> =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as ReadableStream).getReader === "function";

const readStream = async function* readStream(
  stream: ReadableStream<string | Uint8Array>
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let finished = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        finished = true;
        break;
      }
      yield typeof value === "string"
        ? value
        : decoder.decode(value, { stream: true });
    }
    const tail = decoder.decode();
    if (tail) {
      yield tail;
    }
  } finally {
    if (!finished) {
      await reader.cancel().catch(() => null);
    }
    reader.releaseLock();
  }
};

// Turns anything a transport may return into chunks of text.
export const readAiStream = async function* readAiStream(
  source: AiStreamSource
): AsyncGenerator<string> {
  if (typeof source === "string") {
    yield source;
  } else if (isReadableStream(source)) {
    yield* readStream(source);
  } else {
    yield* source;
  }
};

const errorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (data?.error) {
      return String(data.error);
    }
  } catch {
    // The body was not JSON. Fall back to the status code.
  }
  return `AI request failed (${response.status})`;
};

/**
 * POSTs the request as JSON and streams the response body as text. Pairs with
 * a route that returns `streamText(...).toTextStreamResponse()` from the
 * Vercel AI SDK, or any endpoint that streams plain text.
 */
export const createFetchTransport =
  ({
    api,
    body,
    credentials,
    fetch: fetcher = globalThis.fetch,
    headers,
  }: FetchTransportOptions): AiTransport =>
  async (request, { signal }) => {
    const requestHeaders = new Headers(
      typeof headers === "function" ? headers() : headers
    );
    requestHeaders.set("Content-Type", "application/json");
    const extra = typeof body === "function" ? body(request) : body;
    const response = await fetcher(api, {
      body: JSON.stringify({ ...request, ...extra }),
      credentials,
      headers: requestHeaders,
      method: "POST",
      signal,
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response));
    }
    return response.body ?? (await response.text());
  };
