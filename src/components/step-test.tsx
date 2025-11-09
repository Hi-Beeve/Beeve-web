'use client';

import { useState, useRef, useEffect } from 'react';
import { HeartRateDetector } from './heart-rate-detector';
import { Metronome } from './metronome';

// 스텝검사 단계 정의
type StepTestPhase = 
  | 'intro'           // 시작 전 안내
  | 'user-info'       // 연령, 신장, 체중 입력
  | 'exercise'        // 3분 스텝박스 운동
  | 'post-rest'       // 1분 휴식
  | 'recovery-heart-rate' // 1분 회복기 심박수 측정
  | 'result';         // 결과 화면

interface StepTestProps {
  onBack?: () => void;
}

export function StepTest({ onBack }: StepTestProps) {
  const [phase, setPhase] = useState<StepTestPhase>('intro');
  const [recoveryHeartRate, setRecoveryHeartRate] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // 사용자 정보 (국민체력100 예시 데이터 기본값)
  const [age, setAge] = useState<number>(26);
  const [height, setHeight] = useState<number>(165);
  const [weight, setWeight] = useState<number>(60);
  
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
  const handleStartUserInfo = () => {
    setPhase('user-info');
  };

  const handleUserInfoComplete = () => {
    setPhase('exercise');
    startTimer(180, handleExerciseComplete); // 3분 운동
  };

  const handleExerciseComplete = () => {
    setPhase('post-rest');
    startTimer(60, handlePostRestComplete); // 1분 휴식
  };

  const handlePostRestComplete = () => {
    setPhase('recovery-heart-rate');
  };

  const handleRecoveryHeartRateComplete = (heartRate: number) => {
    setRecoveryHeartRate(heartRate);
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

  // 국민체력100 최대산소섭취량 계산 공식
  const calculateVO2Max = (): number => {
    if (!recoveryHeartRate) return 0;
    
    // 예상최대산소섭취량 = 70.597 - 0.246(연령) + 0.077(신장) - 0.222(체중) - 0.147(1분간회복기심박수)
    const vo2max = 70.597 - (0.246 * age) + (0.077 * height) - (0.222 * weight) - (0.147 * recoveryHeartRate);
    
    return Math.round(vo2max * 10) / 10; // 소수점 첫째자리까지
  };

  // 등급 판정 (대략적인 기준)
  const getGradeText = (): string => {
    const vo2max = calculateVO2Max();
    
    if (vo2max >= 55) return '1등급 (매우 우수)';
    if (vo2max >= 50) return '2등급 (우수)';
    if (vo2max >= 45) return '3등급 (양호)';
    if (vo2max >= 40) return '4등급 (보통)';
    return '5등급 (개선 필요)';
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
            <h2 className="text-3xl font-bold mb-6">스텝검사</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              국민체력100 기준 스텝검사입니다.
              <br />
              3분 운동 후 1분 회복기 심박수를 측정하여
              <br />
              최대산소섭취량을 계산합니다.
            </p>
            <button
              onClick={handleStartUserInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105"
            >
              측정 시작
            </button>
          </div>
        )}

        {phase === 'user-info' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">기본 정보 입력</h2>
            <p className="text-gray-300 mb-8">
              최대산소섭취량 계산을 위해 기본 정보를 입력해주세요.
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-gray-300 mb-2">연령 (세)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                  min="10"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">신장 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                  min="100"
                  max="250"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                  min="30"
                  max="200"
                />
              </div>
            </div>
            
            <button
              onClick={handleUserInfoComplete}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
            >
              운동 시작
            </button>
          </div>
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

        {phase === 'recovery-heart-rate' && (
          <HeartRateDetector
            title="1분 회복기 심박수 측정"
            instruction="손가락을 카메라와 플래시에 완전히 덮어주세요"
            onComplete={handleRecoveryHeartRateComplete}
          />
        )}

        {phase === 'result' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-8">측정 완료</h2>
            
            {/* 사용자 정보 */}
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <div className="text-gray-400 text-sm mb-2">입력 정보</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-gray-400 text-xs">연령</div>
                  <div className="text-lg font-bold">{age}세</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">신장</div>
                  <div className="text-lg font-bold">{height}cm</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">체중</div>
                  <div className="text-lg font-bold">{weight}kg</div>
                </div>
              </div>
            </div>
            
            {/* 심박수 결과 */}
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <div className="text-center">
                <div className="text-gray-400 text-sm">1분 회복기 심박수</div>
                <div className="text-3xl font-bold text-red-400 mb-4">{recoveryHeartRate} bpm</div>
                
                {/* 최대산소섭취량 계산 */}
                {recoveryHeartRate && (
                  <div className="border-t border-gray-600 pt-4">
                    <div className="text-gray-400 text-sm">예상 최대산소섭취량</div>
                    <div className="text-2xl font-bold text-green-400">
                      {calculateVO2Max()} ml/kg/min
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      국민체력100 기준: {getGradeText()}
                    </div>
                  </div>
                )}
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

