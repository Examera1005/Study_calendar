// Native Sound Engine using Web Audio API: lazy-loaded shared context for optimal browser performance
let sharedAudioCtx: AudioContext | null = null;

export function playSynthSound(type: "success" | "tick" | "click" | "pop") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    const ctx = sharedAudioCtx;
    
    // Resume context if suspended (browser security autoplays)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Arpeggio sound
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "tick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    }
  } catch (e) {
    // Fail silently if audio output is blocked
  }
}
