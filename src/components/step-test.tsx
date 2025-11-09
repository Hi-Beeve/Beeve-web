'use client';

import { useState, useRef, useEffect } from 'react';
import { HeartRateDetector } from './heart-rate-detector';
import { Metronome } from './metronome';

// 스텝검사 단계 정의
type StepTestPhase = 
  | 'intro'           // 시작 전 안내
  | 'pre-heart-rate'  // 안정시 심박수 측정
  | 'pre-exercise-rest' // 30초 운동 전 휴식
  | 'exercise'        // 3분 스텝박스 운동
  | 'post-rest'       // 1분 휴식
  | 'post-heart-rate' // 운동 후 심박수 측정
  | 'result';         // 결과 화면

interface StepTestProps {
  onBack?: () => void;
}

export function StepTest({ onBack }: StepTestProps) {
  const [phase, setPhase] = useState<StepTestPhase>('intro');
  const [preHeartRate, setPreHeartRate] = useState<number | null>(null);
  const [postHeartRate, setPostHeartRate] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 시작 함수
  const startTimer = (duration: number, onComplete: () => void) => {
    setTimeRemaining(duration);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 단계별 핸들러
  const handleStartMeasurement = () => {
    setPhase('pre-heart-rate');
  };

  const handlePreHeartRateComplete = (heartRate: number) => {
    setPreHeartRate(heartRate);
    setPhase('pre-exercise-rest');
    startTimer(30, handlePreExerciseRestComplete); // 30초 휴식
  };

  const handlePreExerciseRestComplete = () => {
    setPhase('exercise');
    startTimer(180, handleExerciseComplete); // 3분 운동
  };

  const handleExerciseComplete = () => {
    setPhase('post-rest');
    startTimer(60, handlePostRestComplete); // 1분 휴식
  };

  const handlePostRestComplete = () => {
    setPhase('post-heart-rate');
  };

  const handlePostHeartRateComplete = (heartRate: number) => {
    setPostHeartRate(heartRate);
    setPhase('result');
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 시간 포맷 함수 (초 → MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="bg-gray-800 flex items-center justify-between px-4 py-3 border-b border-gray-700">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold flex-1 text-center">스텝검사</h1>
        <div className="w-10"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {phase === 'intro' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">스텝검사 시작</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              3분간 스텝박스 운동을 통해 심폐지구력을 측정합니다.
              <br />
              운동 전후 심박수를 측정하여 결과를 계산합니다.
            </p>
            <button
              onClick={handleStartMeasurement}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105"
            >
              측정 시작
            </button>
          </div>
        )}

        {phase === 'pre-exercise-rest' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">운동 준비</h2>
            <p className="text-gray-300 mb-8">
              스텝박스 운동을 준비하세요.
              <br />
              잠시 후 메트로놈 박자에 맞춰 운동을 시작합니다.
            </p>
            <div className="text-6xl font-mono mb-4">{formatTime(timeRemaining)}</div>
            <div className="text-gray-400">남은 시간</div>
          </div>
        )}

        {phase === 'pre-heart-rate' && (
          <HeartRateDetector
            title="안정시 심박수 측정"
            instruction="손가락을 카메라와 플래시에 완전히 덮어주세요"
            onComplete={handlePreHeartRateComplete}
          />
        )}

        {phase === 'exercise' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">스텝박스 운동</h2>
            <p className="text-gray-300 mb-6">
              메트로놈 박자에 맞춰 스텝박스를 오르내리세요.
            </p>
            
            <div className="text-6xl font-mono mb-2">{formatTime(timeRemaining)}</div>
            <div className="text-gray-400 mb-8">남은 시간</div>
            
            <Metronome 
              bpm={96} 
              isPlaying={true}
              onBeatCount={(count) => {
                // 박자 수에 따른 추가 로직이 필요하면 여기에 구현
              }}
            />
          </div>
        )}

        {phase === 'post-rest' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">운동 후 휴식</h2>
            <p className="text-gray-300 mb-8">
              의자에 앉아서 1분간 휴식을 취하세요.
              <br />
              정확히 1분 후 심박수를 측정합니다.
            </p>
            <div className="text-6xl font-mono mb-4">{formatTime(timeRemaining)}</div>
            <div className="text-gray-400">남은 시간</div>
          </div>
        )}

        {phase === 'post-heart-rate' && (
          <HeartRateDetector
            title="운동 후 심박수 측정"
            instruction="손가락을 카메라와 플래시에 완전히 덮어주세요"
            onComplete={handlePostHeartRateComplete}
          />
        )}

        {phase === 'result' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-8">측정 완료</h2>
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-gray-400 text-sm">안정시 심박수</div>
                  <div className="text-2xl font-bold text-blue-400">{preHeartRate} bpm</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">운동 후 심박수</div>
                  <div className="text-2xl font-bold text-red-400">{postHeartRate} bpm</div>
                </div>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              완료
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

