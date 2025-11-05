/**
 * 사운드 이펙트 유틸리티
 */

// AudioContext 생성 (브라우저 호환성)
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * 비프음 재생
 */
const playBeep = (frequency: number, duration: number, volume: number = 0.3) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

/**
 * 준비 카운트다운 효과음 (10, 9, 8...)
 */
export const playCountdownSound = () => {
  playBeep(800, 0.1, 0.3);
};

/**
 * 측정 시작 효과음 (준비 완료)
 */
export const playStartSound = () => {
  playBeep(1000, 0.15, 0.4);
  setTimeout(() => playBeep(1200, 0.15, 0.4), 150);
};

/**
 * 타이머 째깍 효과음 (60초 측정 중)
 */
export const playTickSound = () => {
  playBeep(600, 0.05, 0.2);
};

/**
 * 푸시업 카운트 효과음
 */
export const playPushupCountSound = () => {
  playBeep(1200, 0.1, 0.4);
  setTimeout(() => playBeep(1400, 0.1, 0.4), 100);
};

/**
 * 호루라기 효과음 (전신 미감지 경고)
 */
export const playWhistleSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // 호루라기 소리 (높은 주파수 2번)
  playBeep(2000, 0.15, 0.5);
  setTimeout(() => playBeep(2000, 0.15, 0.5), 200);
};

/**
 * 측정 완료 효과음
 */
export const playFinishSound = () => {
  playBeep(800, 0.2, 0.4);
  setTimeout(() => playBeep(1000, 0.2, 0.4), 200);
  setTimeout(() => playBeep(1200, 0.3, 0.4), 400);
};
