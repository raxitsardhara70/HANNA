import type { SpeechOutput } from './SpeechOutput';

export class SpeechQueue {
  private readonly items: SpeechOutput[] = [];

  enqueue(output: SpeechOutput): void { this.items.push(output); }
  dequeue(): SpeechOutput | null { return this.items.shift() ?? null; }
  clear(): void { this.items.length = 0; }
  size(): number { return this.items.length; }
  snapshot(): readonly SpeechOutput[] { return [...this.items]; }
}
