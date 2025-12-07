'use client';

import { useState, useRef, useEffect } from 'react';
import { HeartRateDetector } from './heart-rate-detector';
import { Metronome } from './metronome';
import { BackHeader } from './common/BackHeader';
import { FONT_STYLES } from '@/styles/fontStyles';
import { CircleButton, CircleTimer } from './measurement-ui';
import { useMember } from '@/api/mypage/useMypage';
import { useAuth } from '@/contexts/auth-context';
import { getAge } from '@/utils/getAge';
import { Router } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addMeasurementCompletion } from '@/utils/measurement-storage';

// 스텝검사 단계 정의
type StepTestPhase = 
  | 'intro'           // 시작 전 안내
  | 'user-info'       // 연령, 신장, 체중 입력
  | 'exercise'        // 3분 스텝박스 운동
  | 'post-rest'       // 1분 휴식
  | 'recovery-heart-rate' // 1분 회복기 심박수 측정
  | 'result';         // 결과 화면


export function StepTest() {
  const [phase, setPhase] = useState<StepTestPhase>('intro');
  const [recoveryHeartRate, setRecoveryHeartRate] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const router = useRouter();
  const {data} = useMember();
  const { user } = useAuth();

  // 사용자 정보 (국민체력100 예시 데이터 기본값)
  const [age, setAge] = useState<number>(26);
  const [height, setHeight] = useState<number>(165);
  const [weight, setWeight] = useState<number>(60);
  
  useEffect(()=>{
    console.log('🔍 API 데이터:', data);
    console.log('🔍 AuthContext 사용자:', user);
    
    // AuthContext에서 먼저 데이터 확인 (localStorage에 저장된 데이터)
    if (user?.birthDate && user?.height && user?.weight) {
      const calculatedAge = getAge(user.birthDate);
      console.log('🔍 AuthContext에서 계산된 나이:', calculatedAge);
      console.log('🔍 AuthContext 키:', user.height, typeof user.height);
      console.log('🔍 AuthContext 몸무게:', user.weight, typeof user.weight);
      
      // 안전한 타입 변환
      const safeAge = isNaN(calculatedAge) ? 26 : calculatedAge;
      const safeHeight = typeof user.height === 'number' ? user.height : (user.height ? parseFloat(String(user.height)) : 165) || 165;
      const safeWeight = typeof user.weight === 'number' ? user.weight : (user.weight ? parseFloat(String(user.weight)) : 60) || 60;
      
      console.log('🔍 AuthContext 안전한 변환 후:', { safeAge, safeHeight, safeWeight });
      
      setAge(safeAge);
      setHeight(safeHeight);
      setWeight(safeWeight);
    }
    // API 데이터가 있고 AuthContext에 데이터가 없는 경우
    else if(data){
      const calculatedAge = getAge(data.birthDate);
      console.log('🔍 API에서 계산된 나이:', calculatedAge);
      console.log('🔍 API 키:', data.height, typeof data.height);
      console.log('🔍 API 몸무게:', data.weight, typeof data.weight);
      
      // 안전한 타입 변환
      const safeAge = isNaN(calculatedAge) ? 26 : calculatedAge;
      const safeHeight = typeof data.height === 'number' ? data.height : parseFloat(data.height) || 165;
      const safeWeight = typeof data.weight === 'number' ? data.weight : parseFloat(data.weight) || 60;
      
      console.log('🔍 API 안전한 변환 후:', { safeAge, safeHeight, safeWeight });
      
      setAge(safeAge);
      setHeight(safeHeight);
      setWeight(safeWeight);
    }
  },[data, user])

  const onBack = () => {
    router.push('/measurement')
  }
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

  const handleUserInfoComplete = () => {
    setPhase('exercise');
    startTimer(180, handleExerciseComplete); // 3분 운동
  };

  const handleExerciseComplete = () => {
    // 이전 타이머 완전히 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setPhase('post-rest');
    
    // 약간의 지연 후 휴식 타이머 시작
    setTimeout(() => {
      startTimer(60, handlePostRestComplete); // 1분 휴식
    }, 100);
  };

  const handlePostRestComplete = () => {
    setPhase('recovery-heart-rate');
  };

  const handleRecoveryHeartRateComplete = (heartRate: number) => {
    setRecoveryHeartRate(heartRate);
    
    // 측정 결과를 localStorage에 저장
    localStorage.setItem('measurement_cardio', heartRate.toString());
    
    // 측정 완료 상태 저장
    addMeasurementCompletion('cardio');
    
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


  // 국민체력100 최대산소섭취량 계산 공식
  const calculateVO2Max = (): number => {
    if (!recoveryHeartRate) return 0;
    
    // 디버깅 로그 추가
    console.log('🔍 VO2Max 계산 변수들:');
    console.log('age:', age, typeof age);
    console.log('height:', height, typeof height);
    console.log('weight:', weight, typeof weight);
    console.log('recoveryHeartRate:', recoveryHeartRate, typeof recoveryHeartRate);
    
    // 예상최대산소섭취량 = 70.597 - 0.246(연령) + 0.077(신장) - 0.222(체중) - 0.147(1분간회복기심박수)
    const vo2max = 70.597 - (0.246 * age) + (0.077 * height) - (0.222 * weight) - (0.147 * recoveryHeartRate);
    
    console.log('계산된 vo2max:', vo2max);
    
    return Math.round(vo2max * 10) / 10; // 소수점 첫째자리까지
  };

  const handleStopExercise = () => {
    // 측정 중단 시 타이머 정리 및 초기화
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // 타이머를 3분(180초)으로 초기화하고 대기상태로 설정
    setTimeRemaining(180);
    setPhase('exercise');
  };
  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <div className="px-4 py-3 ">
        {onBack && (
          <BackHeader handleClickBack={onBack} />
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {phase === 'intro' && (
          <div className="text-center max-w-md">
            <h2 className={`font-bold mb-6 ${FONT_STYLES.heading28}`}>스텝검사</h2>
            <p className="text-[#767676] mb-8 ">
              3분 운동 후 1분 회복기 심박수를 측정하여
              <br />
              최대산소섭취량을 계산합니다.
            </p>
            <button
              onClick={handleUserInfoComplete}
              className={`bg-[#BDB2DD] text-white py-4 px-8 rounded-full ${FONT_STYLES.body5}`}
            >
              다음
            </button>
          </div>
        )}

        {/* {phase === 'user-info' && (
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
        )} */}

        {phase === 'exercise' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">스텝박스 운동</h2>
            <p className="text-[#767676] mb-6">
              메트로놈 박자에 맞춰 스텝박스를 오르내리세요.
            </p>
            
            
            {phase === 'exercise' && (
              <Metronome 
              bpm={96} 
              isPlaying={true}
              onBeatCount={(count) => {
                // 박자 수에 따른 추가 로직이 필요하면 여기에 구현
              }}
              />
            )}
            <div className='fixed bottom-8 flex justify-between left-8 right-8'>
              <CircleTimer remainingTime={timeRemaining} totalTime={180} />
              <CircleButton onClick={() => {handleStopExercise()}}>중단</CircleButton>
            </div>
          </div>
        )}

        {phase === 'post-rest' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">운동 후 휴식</h2>
            <p className="text-[#767676] mb-8">
              의자에 앉아서 1분간 휴식을 취하세요.
              <br />
              정확히 1분 후 심박수를 측정합니다.
            </p>
            <div className='fixed bottom-8 flex justify-between left-8 right-8'>
              <CircleTimer remainingTime={timeRemaining} totalTime={60} />
              <CircleButton onClick={() => {handleStopExercise()}}>중단</CircleButton>
            </div>
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
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold mb-8">측정 완료</h2>
            
            {/* 심박수 결과 */}
            <div className="bg-[#F5F5F5] p-6 min-w-full rounded-[20px] mb-6">
              <div className="text-center">
                <div className="text-[#767676] text-sm">1분 회복기 심박수</div>
                <div className="text-3xl font-bold text[#D9D4E8] mb-4">{recoveryHeartRate} bpm</div>
                
                {/* 최대산소섭취량 계산 */}
                {recoveryHeartRate && (
                  <div className=" pt-4">
                    <div className="text-[#767676] text-sm">예상 최대산소섭취량</div>
                    <div className="text-2xl font-bold text-[#D1EF2F]">
                      {calculateVO2Max()} ml/kg/min
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className='fixed bottom-8 flex justify-center left-8 right-8'>
            <button
              onClick={onBack}
              className="bg-[#D9D4E8] w-full h-12 text-white font-bold py-3 px-6 rounded-[20px]"
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


