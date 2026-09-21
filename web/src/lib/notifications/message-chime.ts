"use client";

/**
 * The incoming-message chime, synthesised with the Web Audio API rather than
 * shipped as a file: two short notes a fifth apart with a fast attack and a
 * soft exponential tail — the same shape as a messenger "pop", at a level that
 * does not startle someone with headphones on.
 *
 * Synthesising it avoids a network fetch on the first message of a session
 * (when it would arrive too late to play) and keeps the bundle free of a
 * binary asset.
 */

const NOTES = [
  { frequency: 660, startAt: 0, duration: 0.16 },
  { frequency: 990, startAt: 0.09, duration: 0.22 },
] as const;

const PEAK_GAIN = 0.16;

/** Reused across plays; browsers cap how many contexts a page may create. */
let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  context ??= new Ctor();
  return context;
}

export function playMessageChime() {
  const ctx = getContext();
  if (!ctx) return;

  // Autoplay policy parks the context until the page has been interacted
  // with. Resuming is a promise that legitimately rejects on a cold tab.
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;

  for (const note of NOTES) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = note.frequency;

    const start = now + note.startAt;
    const end = start + note.duration;

    // Ramp rather than a hard start/stop: a square-edged envelope clicks.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

const MUTE_STORAGE_KEY = "jl_message_sound_muted";

export function isMessageSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Exposed as an external store so React can read the preference with
 * `useSyncExternalStore`: the server renders "not muted", the client
 * reconciles to the stored value without an effect writing state on mount,
 * and a change in another tab lands here too.
 */
const listeners = new Set<() => void>();

export function subscribeToMessageSound(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** SSR has no localStorage; unmuted is the default the markup is built for. */
export function getMessageSoundServerSnapshot(): boolean {
  return false;
}

export function setMessageSoundMuted(muted: boolean) {
  try {
    if (muted) {
      localStorage.setItem(MUTE_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(MUTE_STORAGE_KEY);
    }
  } catch {
    // A locked-down profile just means the preference lasts one session.
  }
  // `storage` only fires in *other* tabs, so this tab is notified by hand.
  for (const listener of listeners) listener();
}
