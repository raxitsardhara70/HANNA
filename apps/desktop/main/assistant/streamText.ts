const getAbortError = (signal: AbortSignal): Error =>
  signal.reason instanceof Error ? signal.reason : new DOMException('Operation was cancelled.', 'AbortError');

const delay = (milliseconds: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(getAbortError(signal));
      return;
    }

    const timer = setTimeout(resolve, milliseconds);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(getAbortError(signal));
      },
      { once: true },
    );
  });

export async function* streamText(
  text: string,
  options: {
    readonly delayMs?: number;
    readonly signal?: AbortSignal | undefined;
  } = {},
): AsyncGenerator<string> {
  const { delayMs = 20, signal } = options;

  for (const character of text) {
    if (signal?.aborted === true) {
      throw getAbortError(signal);
    }

    yield character;
    await delay(delayMs, signal);
  }
}
