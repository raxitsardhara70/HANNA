const getAbortError = (signal: AbortSignal): Error =>
  signal.reason instanceof Error ? signal.reason : new DOMException('Operation was cancelled.', 'AbortError');

const delay = (milliseconds: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(getAbortError(signal));
      return;
    }

    const timer = window.setTimeout(resolve, milliseconds);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(getAbortError(signal));
      },
      { once: true },
    );
  });

export async function simulateStreaming(
  text: string,
  onChunk: (chunk: string) => void,
  options: {
    readonly delayMs?: number;
    readonly signal?: AbortSignal | undefined;
  } = {},
): Promise<void> {
  const { delayMs = 18, signal } = options;

  for (const character of text) {
    if (signal?.aborted === true) {
      throw getAbortError(signal);
    }

    onChunk(character);
    await delay(delayMs, signal);
  }
}
