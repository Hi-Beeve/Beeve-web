'use client';

import { useEffect, useRef } from 'react';
import { 
  playCountdownSound, 
  playStartSound, 
  playTickSound, 
  playWhistleSound,
  playFinishSound 
} from '@/lib/sound-effects';

export type TimerStatus = 'idle' | 'preparing' | 'measuring' | 'finished';

interface MeasurementTimerProps {
  timerStatus: TimerStatus;
  setTimerStatus: (status: TimerStatus) => void;
  preparingTime: number;
  setPreparingTime: (time: number) => void;
  remainingTime: number;
  setRemainingTime: (time: number) => void;
  isFullBodyDetected: boolean;
  onTimerComplete?: () => void;
  prepareDuration?: number; // 준비 시간 (초), 기본 10초
  measureDuration?: number; // 측정 시간 (초), 기본 60초
}

export function useMeasurementTimer({
  timerStatus,
  setTimerStatus,
  preparingTime,
  setPreparingTime,
  remainingTime,
  setRemainingTime,
  isFullBodyDetected,
  onTimerComplete,
  prepareDuration = 10,
  measureDuration = 60,
}: MeasurementTimerProps) {
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerStatusRef = useRef<TimerStatus>('idle');
  const isFullBodyDetectedRef = useRef(false);
  const whistleSoundPlayedRef = useRef(false);

  // Ref 동기화
  useEffect(() => {
    timerStatusRef.current = timerStatus;
  }, [timerStatus]);

  useEffect(() => {
    isFullBodyDetectedRef.current = isFullBodyDetected;
  }, [isFullBodyDetected]);

  // 측정 시작
  const startMeasurement = () => {
    setTimerStatus('preparing');
    timerStatusRef.current = 'preparing';
    setPreparingTime(prepareDuration);
    setRemainingTime(measureDuration);

    // 준비 카운트다운
    let prepTime = prepareDuration;
    timerIntervalRef.current = setInterval(() => {
      prepTime--;
      setPreparingTime(prepTime);
      playCountdownSound();

      if (prepTime <= 0) {
        // 준비 완료, 측정 시작
        clearInterval(timerIntervalRef.current!);
        setTimerStatus('measuring');
        timerStatusRef.current = 'measuring';
        playStartSound();

        // 측정 타이머 (전신 감지 상태에 따라 중단/재개)
        let measureTime = measureDuration;
        timerIntervalRef.current = setInterval(() => {
          // 전신이 감지될 때만 타이머 감소
          if (isFullBodyDetectedRef.current) {
            measureTime--;
            setRemainingTime(measureTime);
            playTickSound();
            whistleSoundPlayedRef.current = false;

            if (measureTime <= 0) {
              clearInterval(timerIntervalRef.current!);
              setTimerStatus('finished');
              timerStatusRef.current = 'finished';
              playFinishSound();
              onTimerComplete?.();
            }
          } else {
            // 전신 미감지시 호루라기 (1번만)
            if (!whistleSoundPlayedRef.current) {
              playWhistleSound();
              whistleSoundPlayedRef.current = true;
            }
          }
        }, 1000);
      }
    }, 1000);
  };

  // 타이머 리셋
  const resetTimer = () => {
    setTimerStatus('idle');
    timerStatusRef.current = 'idle';
    setPreparingTime(prepareDuration);
    setRemainingTime(measureDuration);
    whistleSoundPlayedRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    startMeasurement,
    resetTimer,
  };
}
