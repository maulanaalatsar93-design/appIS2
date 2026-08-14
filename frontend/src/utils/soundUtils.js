// Utility untuk menghasilkan UI Sounds menggunakan Web Audio API
// Ringan, tanpa file eksternal, dan langsung disintesis oleh browser.

let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playSubmitSound = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export const playSuccessSound = () => {
  try {
    initAudio();

    // Nada 1
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gain1.gain.setValueAtTime(0, audioCtx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.2);

    // Nada 2 (naik)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.1); // G5
    gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.1);
    gain2.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.1);
    osc2.stop(audioCtx.currentTime + 0.4);

  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export const playErrorSound = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

let siuuuAudio = null;

export const playSiuuuSound = () => {
  try {
    if (!siuuuAudio) {
      siuuuAudio = new Audio('/siuuu.mp3');
    }
    // reset to start if it was played before
    siuuuAudio.currentTime = 0;
    siuuuAudio.play().catch(e => console.warn('Audio play failed', e));
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};
