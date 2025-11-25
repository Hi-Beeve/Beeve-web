'use client';

import { ReactNode } from 'react';
import { TimerStatus } from './measurement-timer';

interface MeasurementUIProps {
  // 카메라 관련
  videoRef: React.RefObject<HTMLVideoElement | null>;
  
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
}

export function MeasurementUI({
  videoRef,
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
}: MeasurementUIProps) {
  // 타이머 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* 카메라 화면 */}
          <div className="relative mb-4 bg-gray-800 rounded-lg overflow-hidden border-4 border-blue-500" style={{ aspectRatio: '3/4' }}>
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full ${onVideoClick ? 'cursor-pointer' : ''}`}
              style={{ 
                transform: 'scaleX(-1)',
                objectFit: 'cover'
              }}
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                // 가로가 세로보다 크면 (가로 모드 스트림) 90도 회전
                if (video.videoWidth > video.videoHeight) {
                  video.style.transform = 'scaleX(-1) rotate(90deg)';
                  console.log('Rotating video 90 degrees for portrait mode');
                }
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
            
            
            {/* 준비 중 카운트다운 오버레이 */}
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

          {/* 카운트 & 남은 시간 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="text-5xl font-bold text-blue-400">{count}</div>
              <div className="text-lg text-gray-300 mt-2">{countLabel}</div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="text-5xl font-bold text-green-400">
                {formatTime(remainingTime)}
              </div>
              <div className="text-lg text-gray-300 mt-2">{timeLabel}</div>
            </div>
          </div>

          {/* 추가 정보 (각도 등) */}
          {additionalInfo}

          {/* 피드백 */}
          {feedback && (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center mb-4">
              <div className="text-xl font-semibold text-yellow-300">{feedback}</div>
              {state && (
                <div className="text-sm text-gray-400 mt-2">
                  상태: <span className="text-blue-300 font-semibold">{state.toUpperCase()}</span>
                </div>
              )}
            </div>
          )}

          {/* 사용방법 */}
          {instructions}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="p-4 bg-gray-900 border-t border-gray-700 min-h-[130px]">
        <div className="w-full max-w-2xl mx-auto">
          {!videoRef.current?.srcObject ? (
            <button
              onClick={onStartCamera}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition"
            >
              📹 카메라 시작
            </button>
          ) : timerStatus === 'idle' ? (
            <button
              onClick={onStartMeasurement}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition"
            >
              측정 시작
            </button>
          ) : timerStatus === 'finished' ? (
            <button
              onClick={onReset}
              className="w-full py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold text-lg transition"
            >
              🔄 다시 측정
            </button>
          ) : (
            <button
              onClick={onStopMeasurement}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition"
            >
              ⏹ 측정 중지
            </button>
          )}
        </div>
      </div>
    </>
  );
}
