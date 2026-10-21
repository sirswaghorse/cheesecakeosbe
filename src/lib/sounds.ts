// Cheesecake Chimes: synthesized system sounds via Web Audio (no audio files needed).
export type SoundName =
  | "startup" | "shutdown" | "open" | "close" | "minimize" | "snap"
  | "connect" | "disconnect" | "alert" | "volume";

export const SOUND_LABELS: Record<SoundName, string> = {
  startup: "Startup", shutdown: "Shutdown", open: "Open window", close: "Close window",
  minimize: "Minimize", snap: "Snap / Maximize", connect: "Device connected",
  disconnect: "Device disconnected", alert: "Alert", volume: "Volume change",
};

const read = <T,>(k: string, d: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
};

export const soundsEnabled = () => read("sounds-enabled", true);
export const setSoundsEnabled = (on: boolean) => localStorage.setItem("sounds-enabled", JSON.stringify(on));

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

type Note = [freq: number, start: number, dur: number, type?: OscillatorType];

const PATTERNS: Record<SoundName, Note[]> = {
  startup: [[311, 0, 0.9], [392, 0.18, 0.9], [466, 0.36, 0.9], [622, 0.54, 1.4], [933, 0.54, 1.4, "triangle"]],
  shutdown: [[622, 0, 0.7], [466, 0.22, 0.7], [311, 0.44, 1.2]],
  open: [[660, 0, 0.12], [990, 0.05, 0.15]],
  close: [[740, 0, 0.1], [495, 0.05, 0.14]],
  minimize: [[880, 0, 0.08], [587, 0.04, 0.12]],
  snap: [[1320, 0, 0.06, "triangle"], [1760, 0.03, 0.08, "triangle"]],
  connect: [[523, 0, 0.15], [784, 0.12, 0.25]],
  disconnect: [[784, 0, 0.15], [523, 0.12, 0.25]],
  alert: [[880, 0, 0.5, "triangle"], [1108, 0.1, 0.5, "triangle"]],
  volume: [[1046, 0, 0.12]],
};

export const playSound = (name: SoundName, force = false) => {
  if (!force && !soundsEnabled()) return;
  if (read("tray-muted", false)) return;
  const master = read("tray-volume", 70) / 100;
  if (master <= 0) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = 0.25 * master;
  out.connect(ac.destination);
  for (const [freq, start, dur, type = "sine"] of PATTERNS[name]) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, now + start);
    g.gain.linearRampToValueAtTime(1, now + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
    osc.connect(g).connect(out);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  }
};
