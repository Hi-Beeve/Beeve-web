'use client';

import { ReactNode } from 'react';
import { TimerStatus } from './measurement-timer';
import { FONT_STYLES } from '@/styles/fontStyles';

interface MeasurementUIProps {
  // 측정항목 
  exerciseName: string;

  // 카메라 관련
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPortrait?: boolean; // 세로 카메라 비율 여부
  
  // 타이머 관련
  timerStatus: TimerStatus;
  preparingTime: number;
  remainingTime: number;
  
  // 측정 데이터
  count: number;
  
  // 전신 감지
  isFullBodyDetected: boolean;
  
  // 피드백
  feedback: string;
  state?: string;
  
  // 추가 정보 (각도 등)
  additionalInfo?: ReactNode;
  
  // 사용 방법
  instructions?: ReactNode;
  
  // 버튼
  onStartCamera?: () => void;
  onStartMeasurement?: () => void;
  onStopMeasurement?: () => void;
  onReset?: () => void;
  
  // 비디오 클릭 이벤트
  onVideoClick?: (event: React.MouseEvent<HTMLVideoElement>) => void;
  
  // 커스텀 레이블
  countLabel?: string;
  timeLabel?: string;
  
  // 표시 옵션
  showCount?: boolean;
  showTimer?: boolean;
}

export function MeasurementUI({
  exerciseName,
  videoRef,
  isPortrait = false,
  timerStatus,
  preparingTime,
  remainingTime,
  count,
  isFullBodyDetected,
  feedback,
  state,
  additionalInfo,
  instructions,
  onStartCamera,
  onStartMeasurement,
  onStopMeasurement,
  onReset,
  onVideoClick,
  countLabel = '개수',
  timeLabel = '남은 시간',
  showCount = true,
  showTimer = true,
}: MeasurementUIProps) {

  return (
    <>
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 ">
          {/* 카메라 화면 */}
          <div className="relative mb-4 bg-[#656565] rounded-lg overflow-hidden border-1 border-[#D3C6E6]" style={{ aspectRatio: isPortrait ? '3/4' : '4/3' }}>
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full ${onVideoClick ? 'cursor-pointer' : ''}`}
              style={{ 
                transform: 'scaleX(-1)',
                objectFit: 'cover'
              }}
              playsInline
              autoPlay
              muted
              webkit-playsinline="true"
              x5-playsinline="true"
              x5-video-player-type="h5"
              x5-video-player-fullscreen="false"
              onClick={onVideoClick}
            />
            {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                카메라 화면
              </div>
            )}
            
            
            {/* 준비 중 카운트다운 영상 위에 오버레이 */}
            {timerStatus === 'preparing' && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl font-bold text-white mb-2">{preparingTime}</div>
                  <div className="text-xl text-white">준비하세요!</div>
                </div>
              </div>
            )}
            
            {/* 전신 미감지 경고 오버레이 */}
            {timerStatus === 'measuring' && !isFullBodyDetected && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg">
                ⚠️ 타이머 중단 - 전신을 화면에 보여주세요
              </div>
            )}
          </div>

          {/* 측정항목명 */}
          <div>
            <h1 className={FONT_STYLES.heading32}>{exerciseName}</h1>
          </div>
          {/* TODO : 카운트 표출 UI 미정으로 주석처리*/}
          {/* {(showCount || showTimer) && (
            <div className={`grid gap-4 mb-4 ${showCount && showTimer ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {showCount && (
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <div className="text-5xl font-bold text-blue-400">{count}</div>
                  <div className="text-lg text-gray-300 mt-2">{countLabel}</div>
                </div>
              )}
              
            </div>
          )} */}

          {/* 추가 정보 (각도 등) */}
          {additionalInfo}
          
          {/* 피드백 */}
          {/* {feedback && (
            <div className="bg-[#656565] p-4 rounded-[20px]">
              <div className={`${FONT_STYLES.body5} text-[#D1EF2F]`}>{feedback}</div>
              {state && (
                <div >
                  <span className="text-[#7CE0EF] font-semibold">{state.toUpperCase()}</span>
                </div>
              )}
            </div>
          )} */}

          {/* 사용방법 */}
          {instructions}
      </div>

      {/* 하단 고정 버튼 */}
      <div className='flex justify-between fixed bottom-8 left-8 right-8'>
{showTimer && (
                <div className="relative h-[140px] w-[140px]">
                  {/* SVG 원형 프로그레스 바 */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* 배경 원 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#D9D9D9"
                      strokeWidth="4"
                    />
                    {/* 프로그레스 원 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#9B8EC2"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (remainingTime / 60))}`}
                      style={{
                        transition: 'stroke-dashoffset 1s linear'
                      }}
                    />
                  </svg>
                  {/* 중앙 텍스트 */}
                  <div className={`absolute inset-0 flex items-center justify-center text-[#767676] ${FONT_STYLES.heading32}`}>
                    {formatTime(remainingTime)}
                  </div>
                </div>
              )}
      <div >
          {!videoRef.current?.srcObject ? (
            <CircleButton
            onClick={() => onStartCamera?.()}
            >카메라 시작</CircleButton>
          ) : timerStatus === 'idle' ? (
            <CircleButton
            onClick={() => onStartMeasurement?.()}
            >시작</CircleButton>
          ) : timerStatus === 'finished' ? (
            <CircleButton 
            onClick={() => onReset?.()}
            >재측정</CircleButton>
          ) : (
            <CircleButton
            onClick={() => onStopMeasurement?.()}
            >중단</CircleButton>
          )}
      </div>
          </div>
    </>
  );
}

export const CircleButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 bg-[#BDB2DD] h-[140px] w-[140px] text-white rounded-full flex items-center justify-center ${FONT_STYLES.heading32}`}
    >
      {children}
    </button>
  );
};

  // 타이머 포맷 (MM:SS 또는 SS) 
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    // 60초 이상이면 MM:SS 형식, 미만이면 SS 형식
    if (seconds >= 60) {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${secs.toString().padStart(2, '0')}`;
    }
  };

export const CircleTimer = ({ remainingTime, totalTime }: { remainingTime: number; totalTime?: number }) => {
  // totalTime이 제공되지 않으면 remainingTime을 기준으로 추정
  const maxTime = totalTime || Math.max(remainingTime, 60);
  
  return(
     <div className="relative h-[140px] w-[140px]">
                  {/* SVG 원형 프로그레스 바 */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* 배경 원 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#D9D9D9"
                      strokeWidth="4"
                    />
                    {/* 프로그레스 원 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#9B8EC2"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (remainingTime / maxTime))}`}
                      style={{
                        transition: 'stroke-dashoffset 1s linear'
                      }}
                    />
                  </svg>
                  {/* 중앙 텍스트 */}
                  <div className={`absolute inset-0 flex items-center justify-center text-[#767676] ${FONT_STYLES.heading32}`}>
                    {formatTime(remainingTime)}
                  </div>
                </div>
  )}