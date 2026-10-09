/**
 * Speaks the letters and the completed words with one fixed voice.
 *
 * The device's own local voice is preferred. Where the device has none —
 * nothing that stays off the network — the letters fall back to the committed
 * clips: the same single voice, offline, inside the answer budget (SYSTEM.md).
 * A new sound cuts off the last, so sounds never stack and the volume never
 * rises.
 */
export function createSpeech() {
  const synth = typeof speechSynthesis === "undefined" ? null : speechSynthesis;
  const clips = new Map();
  let voice = null;
  let playing = null;

  function pickVoice() {
    if (synth === null) return;
    const local = synth.getVoices().filter((candidate) => candidate.localService);
    voice = local.find((candidate) => candidate.lang && candidate.lang.startsWith("en")) ?? local[0] ?? null;
  }

  function clipFor(letter) {
    let audio = clips.get(letter);
    if (audio === undefined) {
      audio = new Audio(new URL(`clips/${letter}.wav`, document.baseURI).href);
      audio.preload = "auto";
      clips.set(letter, audio);
    }
    return audio;
  }

  function say(text) {
    if (voice === null || synth === null) return false;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    synth.speak(utterance);
    return true;
  }

  function cutOffLast() {
    if (synth !== null) synth.cancel();
    if (playing !== null) {
      playing.pause();
      playing = null;
    }
  }

  return {
    /** Chooses the voice and keeps it current as the device reports them. */
    ready() {
      pickVoice();
      if (synth !== null) synth.onvoiceschanged = pickVoice;
    },

    /** Speaks a letter's name: the device voice, or the clip when there is none. */
    letter(name) {
      const letter = name.toLowerCase();
      cutOffLast();
      if (say(letter)) return;
      const audio = clipFor(letter);
      audio.currentTime = 0;
      playing = audio;
      audio.play().catch(() => {});
    },

    /** Speaks a completed word or number. Silent when the device has no voice. */
    word(text) {
      say(text);
    },
  };
}
