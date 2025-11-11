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
  const [currentAccelerationData, setCurrentAccelerationData] = useState<{x: number, y: number, z: number} | null>(null);
  
  // Refs
  const accelerometerRef = useRef<any>(null);
  const signalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef(phase); // phase 동기화를 위한 ref
  const baselineAccelerationRef = useRef<{x: number, y: number, z: number} | null>(null);
  const signalTimeRef = useRef<number | null>(null);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // phase 변경 시 phaseRef 업데이트
  useEffect(() => {
    phaseRef.current = phase;
    console.log('🔄 Phase 변경됨:', phase);
    
    // stability-check 단계 진입 시 자동으로 센서 시작
    if (phase === 'stability-check') {
      console.log('🎯 안정성 체크 단계 - 자동 센서 시작');
      if (hasAccelerometer) {
        startAccelerometer();
      }
    }
  }, [phase, hasAccelerometer]);

  // 자동 시작 상태 추가
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);

  // 안정성 점수 모니터링 - 90% 달성 시 한 번만 자동 시작
  useEffect(() => {
    if (phase === 'stability-check' && stabilityScore >= 90 && !autoStartTriggered) {
      console.log('🎯 안정성 90% 달성 - 자동 측정 시작 준비 (한 번만 실행)');
      setAutoStartTriggered(true); // 중복 실행 방지
      
      // 즉시 준비 안내 음성
      const prepareMessage = '3초동안 안정적인 자세를 유지하세요. 자동으로 측정을 시작합니다!';
      const prepareUtterance = new SpeechSynthesisUtterance(prepareMessage);
      prepareUtterance.lang = 'ko-KR';
      prepareUtterance.rate = 0.9;
      prepareUtterance.pitch = 1.0;
      console.log('🔊 준비 안내:', prepareMessage);
      speechSynthesis.speak(prepareUtterance);
      
      // 3초 후 자동 시작
      const autoStartTimer = setTimeout(() => {
        console.log('🚀 자동 측정 시작!');
        
        // 먼저 회차 설정
        const nextAttempt = currentAttempt === 0 ? 1 : currentAttempt;
        setCurrentAttempt(nextAttempt);
        
        // 측정 시작 음성 안내
        const startMessage = `지금부터 ${nextAttempt}회차 측정을 시작하겠습니다`;
        const startUtterance = new SpeechSynthesisUtterance(startMessage);
        startUtterance.lang = 'ko-KR';
        startUtterance.rate = 0.9;
        startUtterance.pitch = 1.0;
        console.log('🔊 시작 안내:', startMessage);
        speechSynthesis.speak(startUtterance);
        
        // 중복 시작 방지를 위한 플래그
        let measurementStarted = false;
        
        // 음성 완료 후 측정 시작
        startUtterance.onend = () => {
          if (!measurementStarted) {
            measurementStarted = true;
            console.log('🎯 음성 완료 - 측정 시작');
            startRandomSignal();
          }
        };
        
        // 음성이 지원되지 않는 경우 대비 (3초 후 강제 시작)
        setTimeout(() => {
          if (!measurementStarted) {
            measurementStarted = true;
            console.log('🎯 타임아웃 - 측정 강제 시작');
            startRandomSignal();
          }
        }, 3000);
        
      }, 3000); // 90% 달성 후 3초 대기
      
      return () => clearTimeout(autoStartTimer);
    }
  }, [phase, stabilityScore, autoStartTriggered]);

  // phase 변경 시 autoStartTriggered 리셋
  useEffect(() => {
    if (phase !== 'stability-check') {
      setAutoStartTriggered(false);
    }
  }, [phase]);

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
    console.log('가속도계 초기화 시작...');
    
    if (!hasAccelerometer) {
      // DeviceMotionEvent 지원 확인
      if (window.DeviceMotionEvent) {
        console.log('DeviceMotionEvent 지원됨');
        setHasAccelerometer(true);
        
        // 테스트 이벤트 리스너로 실제 작동 확인
        const testListener = (event: DeviceMotionEvent) => {
          // console.log('테스트 가속도계 이벤트:', event);
          window.removeEventListener('devicemotion', testListener);
        };
        
        window.addEventListener('devicemotion', testListener, true);
        
        // 3초 후 테스트 리스너 제거 (혹시 이벤트가 안 오는 경우)
        setTimeout(() => {
          window.removeEventListener('devicemotion', testListener);
        }, 3000);
        
        return true;
      } else {
        console.error('DeviceMotionEvent 지원되지 않음');
        alert('이 기기는 가속도계를 지원하지 않습니다.');
        return false;
      }
    }
    return true;
  };

  // 가속도계 시작
  const startAccelerometer = () => {
    if (!hasAccelerometer) return;

    console.log('가속도계 시작 시도...');

    const handleMotion = (event: DeviceMotionEvent) => {
      // 측정 중일 때만 로그 (너무 많은 로그 방지)
      if (phaseRef.current === 'measuring') {
        console.log('🎯 handleMotion 호출됨 (measuring 중):', { 
          phaseState: phase, 
          phaseRef: phaseRef.current, 
          event 
        });
      }
      
      // accelerationIncludingGravity 우선 시도
      let acceleration = event.accelerationIncludingGravity;
      
      // accelerationIncludingGravity가 없으면 acceleration 시도
      if (!acceleration || (acceleration.x === null && acceleration.y === null && acceleration.z === null)) {
        acceleration = event.acceleration;
        console.log('accelerationIncludingGravity 없음, acceleration 사용:', acceleration);
      }
      
      // 둘 다 없으면 rotationRate 시도 (최후의 수단)
      if (!acceleration || (acceleration.x === null && acceleration.y === null && acceleration.z === null)) {
        const rotation = event.rotationRate;
        if (rotation && (rotation.alpha !== null || rotation.beta !== null || rotation.gamma !== null)) {
          console.log('acceleration 없음, rotationRate 사용:', rotation);
          // rotationRate를 가속도처럼 사용 (임시)
          acceleration = {
            x: rotation.alpha || 0,
            y: rotation.beta || 0,
            z: rotation.gamma || 0
          };
        }
      }
      
      if (!acceleration) {
        console.warn('가속도 데이터 없음');
        return;
      }
      
      const { x, y, z } = acceleration;
      if (x === null || y === null || z === null) {
        console.warn('가속도 값이 null:', { x, y, z });
        return;
      }

      // 현재 가속도 값
      const currentAcceleration = { x, y, z };
      // console.log('가속도 값:', currentAcceleration);
      
      // 현재 가속도 데이터 저장
      setCurrentAccelerationData(currentAcceleration);
      
      // 안정성 체크 중일 때
      if (phaseRef.current === 'stability-check') {
        checkStability(currentAcceleration);
      }
      
      // 대기 중일 때 베이스라인 업데이트
      if (phaseRef.current === 'waiting') {
        setBaselineAcceleration(currentAcceleration);
        baselineAccelerationRef.current = currentAcceleration; // Ref도 즉시 업데이트
      }
      
      // 측정 중일 때
      if (phaseRef.current === 'measuring') {
        console.log('🎯🎯🎯 측정 중 - detectMovement 호출 시도');
        console.log('🔍 Ref 값 확인:', {
          baselineRef: !!baselineAccelerationRef.current,
          signalRef: !!signalTimeRef.current,
          baselineState: !!baselineAcceleration,
          signalState: !!signalTime
        });
        
        if (baselineAccelerationRef.current && signalTimeRef.current) {
          console.log('✅✅✅ 조건 만족 (Ref 사용) - detectMovement 호출!');
          detectMovement(currentAcceleration);
        } else {
          console.log('❌❌❌ 조건 불만족 (Ref 사용):', { 
            baselineRef: !!baselineAccelerationRef.current, 
            signalRef: !!signalTimeRef.current 
          });
        }
      } else {
        // phase가 measuring이 아닌 경우에만 로그 (너무 많은 로그 방지)
        if (phaseRef.current === 'stability-check') {
          // 안정성 체크 중이므로 로그 안함
        } else {
          console.log('📍 현재 PhaseRef:', phaseRef.current, 'PhaseState:', phase, '(measuring 아님)');
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion, true);
    accelerometerRef.current = handleMotion;
    console.log('가속도계 이벤트 리스너 등록 완료');
  };

  // 가속도계 정지
  const stopAccelerometer = () => {
    if (accelerometerRef.current) {
      window.removeEventListener('devicemotion', accelerometerRef.current);
      accelerometerRef.current = null;
      console.log('🛑 가속도계 이벤트 리스너 제거 완료');
    }
  };

  // 안정성 체크
  const checkStability = (currentAcceleration: {x: number, y: number, z: number}) => {
    // console.log('안정성 체크:', currentAcceleration);
    
    // 전체 가속도 크기 계산
    const totalAcceleration = Math.sqrt(
      currentAcceleration.x ** 2 + 
      currentAcceleration.y ** 2 + 
      currentAcceleration.z ** 2
    );
    
    // console.log('전체 가속도:', totalAcceleration);
    
    // 안정성 점수 계산 (더 관대한 기준)
    // 일반적으로 중력가속도는 9.8m/s²이지만, 기기마다 다를 수 있음
    let stability;
    
    if (totalAcceleration === 0) {
      // 가속도가 0이면 센서 문제
      stability = 0;
    } else if (totalAcceleration < 5) {
      // 너무 작으면 센서 문제일 가능성
      stability = Math.max(20, totalAcceleration * 10);
    } else if (totalAcceleration > 15) {
      // 너무 크면 불안정
      stability = Math.max(0, 100 - (totalAcceleration - 15) * 5);
    } else {
      // 5-15 범위에서는 상대적으로 안정적
      const deviation = Math.abs(totalAcceleration - 9.8);
      stability = Math.max(30, 100 - deviation * 15);
    }
    
    const finalScore = Math.round(Math.min(100, Math.max(0, stability)));
    // console.log('안정성 점수:', finalScore);
    setStabilityScore(finalScore);
  };

  // 움직임 감지 (개선된 알고리즘)
  const detectMovement = (currentAcceleration: {x: number, y: number, z: number}) => {
    console.log('🔥🔥🔥 detectMovement 함수 호출됨!', {
      current: currentAcceleration,
      baseline: baselineAccelerationRef.current,
      signalTime: signalTimeRef.current
    });
    
    if (!baselineAccelerationRef.current || !signalTimeRef.current) {
      console.warn('베이스라인 또는 신호시간 없음:', { 
        baseline: baselineAccelerationRef.current, 
        signalTime: signalTimeRef.current 
      });
      return;
    }

    // 가속도 변화량 계산 (Ref 사용)
    const baseline = baselineAccelerationRef.current;
    const signal = signalTimeRef.current;
    
    const deltaX = Math.abs(currentAcceleration.x - baseline.x);
    const deltaY = Math.abs(currentAcceleration.y - baseline.y);
    const deltaZ = Math.abs(currentAcceleration.z - baseline.z);
    
    // 전체 변화량
    const totalDelta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
    
    // Y축 중심 즉시 감지 알고리즘
    const verticalThreshold = 0.3; // Y축 임계값
    const totalThreshold = 0.8; // 전체 변화량 임계값
    
    // Y축 감지 (UI와 동일한 조건) - "✓ 발 벌리기 감지!" 조건과 동일
    if (deltaY > verticalThreshold) {
      console.log('🚨🚨🚨 === 발 벌리기 감지! 시점 디버깅 === 🚨🚨🚨');
      console.log('📊 감지 상세 정보:', {
        current: currentAcceleration,
        baseline: baseline,
        deltaY: deltaY.toFixed(3),
        verticalThreshold,
        phase: phaseRef.current,
        hasSignalTime: !!signal,
        signalTime: signal
      });
      console.log('🔥🔥🔥 Y축 움직임 감지! 즉시 반응 처리:', deltaY);
      const reactionTime = performance.now() - signal;
      console.log('⚡ 즉시 반응시간 계산:', reactionTime, 'ms');
      recordReaction(reactionTime);
      return; // 즉시 종료
    }
    
    // 보조 감지: 큰 전체 변화량
    if (totalDelta > totalThreshold) {
      console.log('🚨🚨🚨 === 큰 움직임 감지! 시점 디버깅 === 🚨🚨🚨');
      console.log('📊 감지 상세 정보:', {
        current: currentAcceleration,
        baseline: baseline,
        totalDelta: totalDelta.toFixed(3),
        totalThreshold,
        phase: phaseRef.current,
        hasSignalTime: !!signal,
        signalTime: signal
      });
      console.log('📊 큰 전체 움직임 감지! 즉시 반응 처리:', totalDelta);
      const reactionTime = performance.now() - signal;
      console.log('⚡ 즉시 반응시간 계산:', reactionTime, 'ms');
      recordReaction(reactionTime);
      return; // 즉시 종료
    }
  };

  // 반응 기록
  const recordReaction = (reactionTime: number) => {
    console.log('📝📝📝 recordReaction 호출됨:', { reactionTime, currentAttempt, phase: phaseRef.current });
    
    // 이미 결과 단계이면 중복 처리 방지 (phaseRef 사용)
    if (phaseRef.current === 'result' || phaseRef.current === 'final-result') {
      console.log('⚠️ 이미 결과 단계 - 중복 처리 방지');
      return;
    }
    
    // 즉시 phase 변경으로 중복 호출 방지
    phaseRef.current = 'result';
    
    // 즉시 가속도계 정지 (중복 감지 방지)
    console.log('🛑 즉시 가속도계 정지');
    stopAccelerometer();
    
    const newRecord: ReactionRecord = {
      attempt: currentAttempt,
      reactionTime: reactionTime,
      valid: reactionTime > 100 && reactionTime < 10000 // 100ms ~ 10초로 확장 (테스트용)
    };

    console.log('📊 새 기록 생성:', newRecord);
    
    setRecords(prev => {
      const updated = [...prev, newRecord];
      console.log('📋 기록 업데이트:', updated);
      return updated;
    });
    
    console.log('🔄 단계 변경: measuring → result');
    setPhase('result');
    setIsListening(false);
    
    // 타이머 정리
    if (signalTimerRef.current) {
      clearTimeout(signalTimerRef.current);
      signalTimerRef.current = null;
      console.log('⏰ 타이머 정리 완료');
    }
  };

  // 랜덤 신호음 시작
  const startRandomSignal = () => {
    console.log('랜덤 신호음 시작');
    setPhase('waiting');
    setIsListening(true);
    
    // 베이스라인은 waiting 단계에서 실시간으로 업데이트됨
    console.log('현재 가속도 데이터:', currentAccelerationData);
    if (currentAccelerationData) {
      setBaselineAcceleration(currentAccelerationData);
      console.log('초기 베이스라인 설정:', currentAccelerationData);
    }
    
    // 2-8초 사이 랜덤 대기
    const waitTime = Math.random() * 6000 + 2000;
    console.log('대기 시간:', waitTime, 'ms');
    
    signalTimerRef.current = setTimeout(() => {
      console.log('신호음 재생 및 측정 시작');
      playSignal();
      const currentTime = performance.now();
      setSignalTime(currentTime);
      signalTimeRef.current = currentTime; // Ref도 즉시 업데이트
      setPhase('measuring');
      
      // 측정 시작 시 가속도계 확실히 작동하는지 확인
      if (!accelerometerRef.current) {
        console.log('⚠️ 가속도계가 정지되어 있음 - 재시작');
        startAccelerometer();
      }
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
              다음 단계
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
              
              <p className="text-sm text-gray-300 mb-4">
                {stabilityScore >= 90 ? '🎯 90% 달성! 3초 후 자동으로 측정을 시작합니다!' :
                 stabilityScore >= 80 ? '✅ 고정 상태가 좋습니다! 90%까지 조금 더!' :
                 stabilityScore >= 60 ? '⚠️ 조금 더 단단히 고정해주세요' :
                 stabilityScore === 0 ? '❌ 가속도계 데이터를 받지 못하고 있습니다' :
                 '❌ 휴대폰을 더 안정적으로 고정해주세요'}
              </p>
              
              {stabilityScore >= 90 && !autoStartTriggered && (
                <div className="bg-green-900 border border-green-500 p-3 rounded-lg mb-4">
                  <div className="text-green-300 font-bold text-sm">🚀 자동 시작 준비됨!</div>
                  <div className="text-green-400 text-xs mt-1">
                    안정성 90% 달성으로 곧 측정이 자동 시작됩니다.
                  </div>
                </div>
              )}
              
              {autoStartTriggered && (
                <div className="bg-blue-900 border border-blue-500 p-3 rounded-lg mb-4">
                  <div className="text-blue-300 font-bold text-sm">⏳ 자동 시작 중...</div>
                  <div className="text-blue-400 text-xs mt-1">
                    3초동안 안정적인 자세를 유지하세요!
                  </div>
                </div>
              )}
              
              {/* 디버그 정보 */}
              <div className="bg-gray-700 p-3 rounded text-xs text-gray-400">
                <div>가속도계 지원: {hasAccelerometer ? '✅' : '❌'}</div>
                <div>권한 상태: {accelerometerPermission}</div>
                <div className="mt-2 text-yellow-300">
                  💡 팁: 휴대폰을 허리에 단단히 고정하고 움직이지 마세요
                </div>
              </div>
            </div>

            {stabilityScore >= 60 && (
              <button
                onClick={() => setPhase('ready')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg mb-4"
              >
                측정 준비 완료
              </button>
            )}
            
            <div className="space-y-2">
              <button
                onClick={() => setPhase('setup-guide')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                다시 고정하기
              </button>
              
              {stabilityScore === 0 && (
                <button
                  onClick={() => {
                    // 가속도계 재시작
                    stopAccelerometer();
                    setTimeout(() => {
                      startAccelerometer();
                    }, 1000);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-2"
                >
                  센서 재시작
                </button>
              )}
            </div>
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
              <div className="animate-bounce mb-4">
                <div className="text-6xl mb-4 text-green-400">🔊</div>
                <p className="text-green-400 font-bold text-xl">
                  지금 발을 벌리세요!
                </p>
              </div>
              
              {/* 실시간 감지 정보 */}
              <div className="bg-gray-700 p-3 rounded text-xs text-gray-400 mt-4">
                <div className="mb-3 font-bold text-yellow-300">🎯 발 벌리기 감지 상태:</div>
                {baselineAcceleration && currentAccelerationData && (
                  <>
                    <div className="space-y-2">
                      {/* 주요 감지: Y축 */}
                      <div className="bg-gray-600 p-2 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">🔥 Y축(상하) 움직임:</span>
                          <span className="text-white font-mono">
                            {Math.abs(currentAccelerationData.y - baselineAcceleration.y).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span>임계값: &gt; 0.3</span>
                          {Math.abs(currentAccelerationData.y - baselineAcceleration.y) > 0.3 ? 
                            <span className="text-green-400 font-bold text-lg">✓ 발 벌리기 감지!</span> : 
                            <span className="text-gray-400">대기 중...</span>}
                        </div>
                      </div>
                      
                      {/* 보조 감지: 전체 변화량 */}
                      <div className="bg-gray-600 p-2 rounded">
                        <div className="flex justify-between items-center">
                          <span>📊 전체 변화량:</span>
                          <span className="text-white font-mono">
                            {Math.sqrt(
                              Math.pow(currentAccelerationData.x - baselineAcceleration.x, 2) +
                              Math.pow(currentAccelerationData.y - baselineAcceleration.y, 2) +
                              Math.pow(currentAccelerationData.z - baselineAcceleration.z, 2)
                            ).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span>임계값: &gt; 0.8</span>
                          {Math.sqrt(
                            Math.pow(currentAccelerationData.x - baselineAcceleration.x, 2) +
                            Math.pow(currentAccelerationData.y - baselineAcceleration.y, 2) +
                            Math.pow(currentAccelerationData.z - baselineAcceleration.z, 2)
                          ) > 0.8 ? 
                            <span className="text-green-400 font-bold">✓ 큰 움직임!</span> : 
                            <span className="text-gray-400">대기 중...</span>}
                        </div>
                      </div>
                      
                      {/* 디버깅 정보 */}
                      <div className="bg-red-900 p-2 rounded mt-2">
                        <div className="text-red-300 font-bold text-xs mb-1">🔍 디버깅 상태:</div>
                        <div className="text-xs space-y-1">
                          <div>Phase: <span className="text-white">{phase}</span></div>
                          <div>BaselineAcceleration: <span className="text-white">{baselineAcceleration ? '✅ 있음' : '❌ 없음'}</span></div>
                          <div>SignalTime: <span className="text-white">{signalTime ? '✅ 있음' : '❌ 없음'}</span></div>
                          <div>가속도계: <span className="text-white">{accelerometerRef.current ? '🟢 작동중' : '🔴 정지됨'}</span></div>
                        </div>
                      </div>
                      
                      {/* 참고 정보 */}
                      <div className="text-xs text-gray-500 mt-2">
                        <div>X축(좌우): {Math.abs(currentAccelerationData.x - baselineAcceleration.x).toFixed(3)}</div>
                        <div>Z축(앞뒤): {Math.abs(currentAccelerationData.z - baselineAcceleration.z).toFixed(3)}</div>
                      </div>
                    </div>
                  </>
                )}
                <div className="mt-3 text-yellow-300 text-center">
                  💡 Y축 움직임이 0.3 이상이면 자동 감지됩니다
                </div>
              </div>
            </div>
            
            {/* 수동 완료 버튼 */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  // 현재 시점 반응시간 측정
                  if (signalTime) {
                    const reactionTime = performance.now() - signalTime;
                    console.log('수동 측정, 반응시간:', reactionTime);
                    recordReaction(reactionTime);
                  } else {
                    console.warn('신호시간이 설정되지 않음');
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                지금 측정하기
              </button>
              
              <button
                onClick={() => {
                  // 측정 건너뛰기 (무효 처리)
                  console.log('측정 건너뛰기');
                  const invalidReactionTime = 9999; // 무효한 시간으로 설정
                  recordReaction(invalidReactionTime);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                건너뛰기
              </button>
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
