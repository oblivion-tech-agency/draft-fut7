'use client';

// Avisos de turno: sonido (Web Audio, sin archivos), vibración, título de la
// pestaña y notificación del navegador cuando la pestaña está en segundo plano.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

/**
 * Los navegadores solo dejan reproducir audio después de una interacción.
 * Se llama en el primer click/tap para que los avisos posteriores suenen.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx?.state === 'suspended') void ctx.resume();
}

function playNotes(notes: Array<[freq: number, start: number, duration: number]>, volume = 0.18) {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  for (const [freq, start, duration] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(volume, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.05);
  }
}

/** Silbato + acorde ascendente: "¡te toca!". */
export function playYourTurn(): void {
  playNotes([
    [523.25, 0, 0.18],
    [659.25, 0.12, 0.18],
    [783.99, 0.24, 0.35],
    [1046.5, 0.36, 0.5],
  ]);
}

/** Sonido corto y suave para cada pick. */
export function playPick(): void {
  playNotes(
    [
      [880, 0, 0.12],
      [1174.66, 0.08, 0.2],
    ],
    0.08
  );
}

export function vibrate(pattern: number[] = [120, 60, 120]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!notificationsSupported()) return null;
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export function showSystemNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return;
  try {
    const n = new Notification(title, { body, tag: 'draft7-turn' });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Algunos navegadores móviles solo permiten notificaciones vía service worker.
  }
}

let titleTimer: ReturnType<typeof setInterval> | null = null;
let originalTitle = '';

/** Hace titilar el título de la pestaña hasta que se vuelva a ella. */
export function flashTitle(message: string): void {
  if (typeof document === 'undefined' || titleTimer) return;
  originalTitle = document.title;
  let on = false;
  titleTimer = setInterval(() => {
    document.title = (on = !on) ? message : originalTitle;
  }, 1000);
  const stop = () => {
    if (document.visibilityState !== 'visible') return;
    stopFlashTitle();
    document.removeEventListener('visibilitychange', stop);
  };
  document.addEventListener('visibilitychange', stop);
  if (document.visibilityState === 'visible') setTimeout(stop, 4000);
}

export function stopFlashTitle(): void {
  if (titleTimer) clearInterval(titleTimer);
  titleTimer = null;
  if (originalTitle) document.title = originalTitle;
}
