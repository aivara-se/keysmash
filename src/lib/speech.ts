/**
 * Speaks the letters and the completed words with one fixed voice.
 *
 * The device's own local voice is preferred. Where the device has none —
 * nothing that stays off the network — the letters fall back to the committed
 * clips: the same single voice, offline, inside the answer budget (SYSTEM.md).
 * A new sound cuts off the last, so sounds never stack and the volume never
 * rises.
 */
import { assetUrl } from "./assets.js";

/** The speaker as the rest of the app uses it. */
export interface Speech {
  ready(): void;
  letter(name: string): void;
  word(text: string): void;
}

export function createSpeech(): Speech {
  const synth = typeof speechSynthesis === "undefined" ? null : speechSynthesis;
  const clips = new Map<string, HTMLAudioElement>();
  let voice: SpeechSynthesisVoice | null = null;
  let playing: HTMLAudioElement | null = null;

  function pickVoice(): void {
    if (synth === null) return;
    const local = synth.getVoices().filter((candidate) => candidate.localService);
    voice = local.find((candidate) => candidate.lang && candidate.lang.startsWith("en")) ?? local[0] ?? null;
  }

  function clipFor(letter: string): HTMLAudioElement {
    let audio = clips.get(letter);
    if (audio === undefined) {
      audio = new Audio(assetUrl(`clips/${letter}.wav`));
      audio.preload = "auto";
      clips.set(letter, audio);
    }
    return audio;
  }

  function say(text: string): boolean {
    if (voice === null || synth === null) return false;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    synth.speak(utterance);
    return true;
  }

  function cutOffLast(): void {
    if (synth !== null) synth.cancel();
    if (playing !== null) {
      playing.pause();
      playing = null;
    }
  }

  return {
    /** Chooses the voice and keeps it current as the device reports them. */
    ready(): void {
      pickVoice();
      if (synth !== null) synth.onvoiceschanged = pickVoice;
    },

    /** Speaks a letter's name: the device voice, or the clip when there is none. */
    letter(name: string): void {
      const letter = name.toLowerCase();
      cutOffLast();
      if (say(letter)) return;
      const audio = clipFor(letter);
      audio.currentTime = 0;
      playing = audio;
      audio.play().catch(() => {});
    },

    /** Speaks a completed word or number. Silent when the device has no voice. */
    word(text: string): void {
      say(text);
    },
  };
}
