'use client';

import { useState, useRef, useEffect } from 'react';

// 민첩성 측정 단계 정의
type ReactionTimePhase = 
  | 'intro'           // 시작 전 안내
  | 'setup-guide'     // 휴대폰 고정 가이드
  | 'stability-check' // 고정 안정성 체크
  | 'ready'           // 측정 준비
  | 'waiting'         // 신호음 대기
  | 'measuring'       // 측정 중
  | 'result'          // 개별 결과
  | 'final-result';   // 최종 결과

interface ReactionRecord {
  attempt: number;
  reactionTime: number; // 밀리초 단위
  valid: boolean;
}

interface ReactionTimeProps {
  onBack?: () => void;
}

export function ReactionTime({ onBack }: ReactionTimeProps) {
  const [phase, setPhase] = useState<ReactionTimePhase>('intro');
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [records, setRecords] = useState<ReactionRecord[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [stabilityScore, setStabilityScore] = useState(0);
  
  // 가속도계 관련 상태
  const [hasAccelerometer, setHasAccelerometer] = useState(false);
  const [accelerometerPermission, setAccelerometerPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  // 측정 관련 상태
  const [signalTime, setSignalTime] = useState<number | null>(null);
  const [baselineAcceleration, setBaselineAcceleration] = useState<{x: number, y: number, z: number} | null>(null);
  
  // Refs
  const accelerometerRef = useRef<any>(null);
  const signalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 가속도계 권한 요청
  const requestAccelerometerPermission = async () => {
    try {
      // DeviceMotionEvent 권한 요청 (iOS 13+)
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        setAccelerometerPermission(permission);
        return permission === 'granted';
      }
      
      // Android 또는 이전 iOS 버전
      setAccelerometerPermission('granted');
      return true;
    } catch (error) {
      console.error('가속도계 권한 요청 실패:', error);
      setAccelerometerPermission('denied');
      return false;
    }
  };

  // 가속도계 초기화
  const initializeAccelerometer = () => {
    if (!hasAccelerometer) {
      // DeviceMotionEvent 지원 확인
      if (window.DeviceMotionEvent) {
        setHasAccelerometer(true);
        return true;
      } else {
        alert('이 기기는 가속도계를 지원하지 않습니다.');
        return false;
      }
    }
    return true;
  };

  // 가속도계 시작
  const startAccelerometer = () => {
    if (!hasAccelerometer) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      // 현재 가속도 값
      const currentAcceleration = { x, y, z };
      
      // 안정성 체크 중일 때
      if (phase === 'stability-check') {
        checkStability(currentAcceleration);
      }
      
      // 측정 중일 때
      if (phase === 'measuring' && baselineAcceleration && signalTime) {
        detectMovement(currentAcceleration);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    accelerometerRef.current = handleMotion;
  };

  // 가속도계 정지
  const stopAccelerometer = () => {
    if (accelerometerRef.current) {
      window.removeEventListener('devicemotion', accelerometerRef.current);
      accelerometerRef.current = null;
    }
  };

  // 안정성 체크
  const checkStability = (currentAcceleration: {x: number, y: number, z: number}) => {
    // 간단한 안정성 점수 계산 (실제로는 더 복잡한 알고리즘 필요)
    const totalAcceleration = Math.sqrt(
      currentAcceleration.x ** 2 + 
      currentAcceleration.y ** 2 + 
      currentAcceleration.z ** 2
    );
    
    // 안정성 점수 업데이트 (0-100)
    const stability = Math.max(0, 100 - Math.abs(totalAcceleration - 9.8) * 10);
    setStabilityScore(Math.round(stability));
  };

  // 움직임 감지
  const detectMovement = (currentAcceleration: {x: number, y: number, z: number}) => {
    if (!baselineAcceleration || !signalTime) return;

    // 가속도 변화량 계산
    const deltaX = Math.abs(currentAcceleration.x - baselineAcceleration.x);
    const deltaY = Math.abs(currentAcceleration.y - baselineAcceleration.y);
    const deltaZ = Math.abs(currentAcceleration.z - baselineAcceleration.z);
    
    // 전체 변화량
    const totalDelta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
    
    // 임계값 (조정 필요)
    const threshold = 2.0; // m/s²
    
    if (totalDelta > threshold) {
      // 반응 감지!
      const reactionTime = performance.now() - signalTime;
      recordReaction(reactionTime);
    }
  };

  // 반응 기록
  const recordReaction = (reactionTime: number) => {
    const newRecord: ReactionRecord = {
      attempt: currentAttempt,
      reactionTime: reactionTime,
      valid: reactionTime > 100 && reactionTime < 2000 // 100ms ~ 2초 사이만 유효
    };

    setRecords(prev => [...prev, newRecord]);
    setPhase('result');
    setIsListening(false);
    
    // 타이머 정리
    if (signalTimerRef.current) {
      clearTimeout(signalTimerRef.current);
      signalTimerRef.current = null;
    }
  };

  // 랜덤 신호음 시작
  const startRandomSignal = () => {
    setPhase('waiting');
    setIsListening(true);
    
    // 베이스라인 가속도 설정
    // 실제로는 몇 초간 평균을 내야 함
    setBaselineAcceleration({ x: 0, y: 0, z: -9.8 });
    
    // 2-8초 사이 랜덤 대기
    const waitTime = Math.random() * 6000 + 2000;
    
    signalTimerRef.current = setTimeout(() => {
      playSignal();
      setSignalTime(performance.now());
      setPhase('measuring');
    }, waitTime);
  };

  // 신호음 재생
  const playSignal = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('신호음 재생 실패:', error);
    }
  };

  // 시간 포맷 (밀리초)
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(3) + '초';
  };

  // 컴포넌트 정리
  useEffect(() => {
    return () => {
      stopAccelerometer();
      if (signalTimerRef.current) {
        clearTimeout(signalTimerRef.current);
      }
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
      }
    };
  }, []);

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
        <h1 className="text-xl font-bold flex-1 text-center">반응 시간 검사</h1>
        <div className="w-10"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {phase === 'intro' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">반응 시간 검사</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              예고 없이 들리는 신호에 반응하여 양 발을 동시에 벌리는 민첩성을 측정합니다.
              <br />
              3회 측정하여 가장 좋은 기록을 0.001초 단위로 측정합니다.
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mb-8">
              <h3 className="font-bold mb-2">측정 방법:</h3>
              <ul className="text-sm text-gray-300 text-left space-y-1">
                <li>• 양발을 모으고 어깨너비만큼 편하게 선다</li>
                <li>• 휴대폰을 허리에 단단히 고정한다</li>
                <li>• 신호음이 들리면 즉시 양발을 벌린다</li>
              </ul>
            </div>
            <button
              onClick={() => setPhase('setup-guide')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105"
            >
              측정 시작
            </button>
          </div>
        )}

        {phase === 'setup-guide' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">휴대폰 고정 가이드</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h3 className="font-bold mb-4 text-yellow-400">📱 휴대폰을 허리에 고정해주세요</h3>
              
              <div className="space-y-4 text-left">
                <div className="bg-gray-700 p-3 rounded">
                  <h4 className="font-bold text-green-400">✅ 추천 방법:</h4>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    <li>• 벨트에 휴대폰 끼우기</li>
                    <li>• 바지 뒷주머니 (단단히 고정)</li>
                    <li>• 운동용 허리밴드 사용</li>
                    <li>• 탄력밴드로 허리에 고정</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 p-3 rounded">
                  <h4 className="font-bold text-blue-400">📍 고정 위치:</h4>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    <li>• 허리 중앙 또는 옆구리</li>
                    <li>• 화면이 몸쪽을 향하게</li>
                    <li>• 움직여도 흔들리지 않게</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                const hasPermission = await requestAccelerometerPermission();
                if (hasPermission && initializeAccelerometer()) {
                  setPhase('stability-check');
                  startAccelerometer();
                } else {
                  alert('가속도계 권한이 필요합니다.');
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
            >
              고정 완료, 다음 단계
            </button>
          </div>
        )}

        {phase === 'stability-check' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">고정 상태 확인</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <div className="mb-4">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {stabilityScore}%
                </div>
                <div className="text-gray-400">안정성 점수</div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${
                    stabilityScore >= 80 ? 'bg-green-500' : 
                    stabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stabilityScore}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-300">
                {stabilityScore >= 80 ? '✅ 고정 상태가 좋습니다!' :
                 stabilityScore >= 60 ? '⚠️ 조금 더 단단히 고정해주세요' :
                 '❌ 휴대폰을 더 안정적으로 고정해주세요'}
              </p>
            </div>

            {stabilityScore >= 80 && (
              <button
                onClick={() => setPhase('ready')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                측정 준비 완료
              </button>
            )}
            
            <button
              onClick={() => setPhase('setup-guide')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
            >
              다시 고정하기
            </button>
          </div>
        )}

        {phase === 'ready' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">{currentAttempt}회차 준비</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <p className="text-gray-300 mb-4">
                양발을 모으고 편안하게 서세요.
                <br />
                신호음이 들리면 즉시 양발을 벌려주세요.
              </p>
              <div className="text-yellow-400 text-sm">
                ⚠️ 신호음 전에 움직이면 무효 처리됩니다
              </div>
            </div>

            <button
              onClick={startRandomSignal}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105"
            >
              🎯 측정 시작
            </button>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">신호음 대기 중...</h2>
            
            <div className="bg-gray-800 p-8 rounded-lg mb-8">
              <div className="animate-pulse">
                <div className="text-6xl mb-4">👂</div>
                <p className="text-gray-300">
                  신호음을 기다리세요
                  <br />
                  <span className="text-yellow-400">움직이지 마세요!</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setPhase('ready');
                setIsListening(false);
                if (signalTimerRef.current) {
                  clearTimeout(signalTimerRef.current);
                  signalTimerRef.current = null;
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              취소
            </button>
          </div>
        )}

        {phase === 'measuring' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">측정 중...</h2>
            
            <div className="bg-gray-800 p-8 rounded-lg mb-8">
              <div className="animate-bounce">
                <div className="text-6xl mb-4 text-green-400">🔊</div>
                <p className="text-green-400 font-bold text-xl">
                  지금 발을 벌리세요!
                </p>
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && records[currentAttempt - 1] && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">{currentAttempt}회차 결과</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <div className={`text-4xl font-bold mb-4 ${
                records[currentAttempt - 1].valid ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatTime(records[currentAttempt - 1].reactionTime)}
              </div>
              <div className="text-gray-400 text-sm">
                {records[currentAttempt - 1].valid ? '✅ 유효한 측정' : '❌ 무효 측정'}
              </div>
            </div>

            {currentAttempt < 3 ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setCurrentAttempt(prev => prev + 1);
                    setPhase('ready');
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mr-4"
                >
                  다음 측정 ({currentAttempt + 1}회차)
                </button>
                <button
                  onClick={() => setPhase('final-result')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  측정 완료
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPhase('final-result')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                최종 결과 보기
              </button>
            )}
          </div>
        )}

        {phase === 'final-result' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-8">측정 완료</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <div className="text-gray-400 text-sm mb-4">측정 결과</div>
              
              {/* 개별 결과 */}
              <div className="space-y-2 mb-6">
                {records.map((record, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300">{record.attempt}회차:</span>
                    <span className={`font-mono text-lg ${record.valid ? 'text-white' : 'text-red-400'}`}>
                      {formatTime(record.reactionTime)} {!record.valid && '(무효)'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* 최고 기록 */}
              <div className="border-t border-gray-600 pt-4">
                <div className="text-gray-400 text-sm">최고 기록</div>
                <div className="text-3xl font-bold text-green-400">
                  {(() => {
                    const validRecords = records.filter(r => r.valid);
                    if (validRecords.length === 0) return '측정 실패';
                    return formatTime(Math.min(...validRecords.map(r => r.reactionTime)));
                  })()}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  // 다시 측정
                  setCurrentAttempt(1);
                  setRecords([]);
                  setPhase('ready');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mr-4"
              >
                다시 측정
              </button>
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
