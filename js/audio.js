// Efeitos sonoros sintetizados via Web Audio API (sem arquivos externos),
// no estilo "Duolingo": cliques curtos e um jingle de avanço/conclusão.

let ctx = null;
let muted = false;

try {
  muted = localStorage.getItem("vs_muted") === "1";
} catch (_) {
  muted = false;
}

function getCtx() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

export function isMuted() {
  return muted;
}

export function toggleMuted() {
  muted = !muted;
  try {
    localStorage.setItem("vs_muted", muted ? "1" : "0");
  } catch (_) {
    /* ignore */
  }
  return muted;
}

function tone(freq, start, duration, { type = "sine", gain = 0.16, glideTo = null } = {}) {
  const audio = getCtx();
  if (!audio || muted) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  if (glideTo) {
    osc.frequency.exponentialRampToValueAtTime(glideTo, audio.currentTime + start + duration);
  }
  g.gain.setValueAtTime(0.0001, audio.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, audio.currentTime + start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(g).connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.02);
}

export function playTap() {
  tone(520, 0, 0.06, { type: "triangle", gain: 0.12 });
}

export function playSelect() {
  tone(660, 0, 0.09, { type: "triangle", gain: 0.15 });
  tone(880, 0.05, 0.09, { type: "triangle", gain: 0.12 });
}

export function playDeselect() {
  tone(440, 0, 0.08, { type: "triangle", gain: 0.11 });
}

export function playAdvance() {
  tone(523.25, 0, 0.1, { type: "sine", gain: 0.16 }); // C5
  tone(783.99, 0.09, 0.16, { type: "sine", gain: 0.16 }); // G5
}

export function playBack() {
  tone(523.25, 0, 0.09, { type: "sine", gain: 0.13 });
  tone(392.0, 0.07, 0.12, { type: "sine", gain: 0.13 });
}

export function playComplete() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((f, i) => tone(f, i * 0.11, 0.22, { type: "sine", gain: 0.17 }));
}
