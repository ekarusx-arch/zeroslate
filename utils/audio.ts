export function playAlarm(type: "start" | "end") {
  // 브라우저에서 사용자 상호작용 없이 AudioContext를 생성/재생하면 경고가 뜰 수 있으나,
  // 드래그앤드롭 등 클릭 이벤트 후에는 정상적으로 해제(Unlock)됩니다.
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === "start") {
      // 시작 알림: 경쾌하게 띠링 (높은 피치)
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
      // 종료 알림: 마무리되는 느낌의 뚜둥 (두 번 울림)
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      
      // 두 번째 비프
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(349.23, ctx.currentTime); // F4
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 250);
    }
  } catch (err) {
    console.error("Audio playback failed", err);
  }
}

export type AmbientSoundId = "rain" | "cafe" | "deep" | "lofi";

type AudioCtx = AudioContext & {
  createMediaStreamDestination?: AudioContext["createMediaStreamDestination"];
};

function getAudioContext() {
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextCtor) return null;
  return new AudioContextCtor() as AudioCtx;
}

function createNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

export class AmbientSoundController {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private timers: number[] = [];
  private activeSound: AmbientSoundId | null = null;

  async start(sound: AmbientSoundId) {
    this.stop();

    const ctx = this.ctx ?? getAudioContext();
    if (!ctx) return;
    this.ctx = ctx;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    this.activeSound = sound;
    this.gain = ctx.createGain();
    this.gain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.4);
    this.gain.connect(ctx.destination);

    if (sound === "rain") this.startRain(ctx);
    if (sound === "cafe") this.startCafe(ctx);
    if (sound === "deep") this.startDeep(ctx);
    if (sound === "lofi") this.startLofi(ctx);
  }

  stop() {
    const ctx = this.ctx;

    if (ctx && this.gain) {
      this.gain.gain.cancelScheduledValues(ctx.currentTime);
      this.gain.gain.setTargetAtTime(0.001, ctx.currentTime, 0.08);
    }

    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];

    this.nodes.forEach((node) => {
      try {
        if ("stop" in node) (node as AudioScheduledSourceNode).stop();
      } catch {
        // Source may already be stopped.
      }
      try {
        node.disconnect();
      } catch {
        // Node may already be disconnected.
      }
    });

    this.nodes = [];
    this.activeSound = null;
  }

  dispose() {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }

  private connect(node: AudioNode) {
    if (!this.gain) return;
    node.connect(this.gain);
    this.nodes.push(node);
  }

  private startNoise(ctx: AudioContext, filterType: BiquadFilterType, frequency: number, q: number, gainValue = 1) {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;

    const localGain = ctx.createGain();
    localGain.gain.value = gainValue;

    source.connect(filter);
    filter.connect(localGain);
    this.connect(localGain);
    this.nodes.push(source, filter);
    source.start();
  }

  private startRain(ctx: AudioContext) {
    this.startNoise(ctx, "bandpass", 1800, 0.7, 0.8);
    this.startNoise(ctx, "lowpass", 650, 0.4, 0.45);
  }

  private startCafe(ctx: AudioContext) {
    this.startNoise(ctx, "lowpass", 900, 0.6, 0.35);
    this.startNoise(ctx, "bandpass", 260, 0.8, 0.25);

    const addCupTick = () => {
      if (this.activeSound !== "cafe" || !this.gain) return;
      const osc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(720 + Math.random() * 260, ctx.currentTime);
      tickGain.gain.setValueAtTime(0.04, ctx.currentTime);
      tickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(tickGain);
      tickGain.connect(this.gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      this.nodes.push(osc, tickGain);
    };

    this.timers.push(window.setInterval(addCupTick, 2600));
  }

  private startDeep(ctx: AudioContext) {
    this.startNoise(ctx, "lowpass", 320, 0.5, 0.32);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 58;
    oscGain.gain.value = 0.18;
    osc.connect(oscGain);
    this.connect(oscGain);
    this.nodes.push(osc);
    osc.start();
  }

  private startLofi(ctx: AudioContext) {
    this.startNoise(ctx, "lowpass", 520, 0.5, 0.18);

    const notes = [196, 246.94, 293.66, 329.63];
    let index = 0;

    const playNote = () => {
      if (this.activeSound !== "lofi" || !this.gain) return;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(notes[index % notes.length], ctx.currentTime);
      filter.type = "lowpass";
      filter.frequency.value = 900;
      noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.gain);
      osc.start();
      osc.stop(ctx.currentTime + 1);
      this.nodes.push(osc, filter, noteGain);
      index += 1;
    };

    playNote();
    this.timers.push(window.setInterval(playNote, 1200));
  }
}

export function createAmbientSoundController() {
  return new AmbientSoundController();
}
