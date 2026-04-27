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
