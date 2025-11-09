'use client';

import { useState, useRef, useEffect } from 'react';

interface MetronomeProps {
  bpm: number;
  isPlaying: boolean;
  onBeatCount?: (count: number) => void;
}

export function Metronome({ bpm, isPlaying, onBeatCount }: MetronomeProps) {
  const [beatCount, setBeatCount] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0); // 시각적 표시용
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio API를 사용한 비프음 생성
  const playBeep = (frequency: number = 800, duration: number = 100) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  };

  // 메트로놈 시작/정지
  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / bpm; // BPM을 밀리초로 변환
      
      intervalRef.current = setInterval(() => {
        setBeatCount(prev => {
          const newCount = prev + 1;
          
          // 4박자 패턴 (1박자는 높은 음, 나머지는 낮은 음)
          const beatInMeasure = (newCount - 1) % 4;
          const frequency = beatInMeasure === 0 ? 1000 : 800;
          
          playBeep(frequency, 100);
          setCurrentBeat(beatInMeasure + 1);
          
          if (onBeatCount) {
            onBeatCount(newCount);
          }
          
          return newCount;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, onBeatCount]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-4xl font-bold text-blue-400 mb-2">{bpm} BPM</div>
        <div className="text-gray-400">메트로놈</div>
      </div>
      
      {/* 박자 시각적 표시 */}
      <div className="flex justify-center space-x-2 mb-4">
        {[1, 2, 3, 4].map((beat) => (
          <div
            key={beat}
            className={`w-4 h-4 rounded-full transition-all duration-100 ${
              currentBeat === beat
                ? beat === 1
                  ? 'bg-red-500 scale-125'  // 1박자는 빨간색
                  : 'bg-blue-500 scale-125' // 나머지는 파란색
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      
      <div className="text-lg text-gray-300">
        총 박자: {beatCount}
      </div>
      
      {isPlaying && (
        <div className="mt-4 text-sm text-gray-400">
          스텝박스를 박자에 맞춰 오르내리세요
        </div>
      )}
    </div>
  );
}
