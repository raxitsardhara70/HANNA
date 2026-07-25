export interface SpeechOutput {
  readonly id: string;
  readonly text: string;
  readonly voiceId: string | null;
  readonly volume: number;
  readonly rate: number;
}
