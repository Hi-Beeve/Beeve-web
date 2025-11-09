'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoAnalyzerProps {
  videoBlob: Blob;
  onAnalysisComplete: (startTime: number, peakTime: number, airTime: number) => void;
  onCancel: () => void;
}

export function VideoAnalyzer({ videoBlob, onAnalysisComplete, onCancel }: VideoAnalyzerProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [peakTime, setPeakTime] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 비디오 URL 생성
  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  // 비디오 메타데이터 로드
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setCurrentTime(0);
    }
  };

  // 재생/일시정지 토글
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      updateCurrentTime();
    }
  };

  // 현재 시간 업데이트
  const updateCurrentTime = () => {
    if (videoRef.current && isPlaying) {
      setCurrentTime(videoRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
    }
  };

  // 슬라이더로 시간 이동
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 프레임 단위 이동 (1/60초)
  const moveFrame = (direction: 'forward' | 'backward') => {
    if (!videoRef.current) return;
    
    const frameTime = 1 / 60; // 60fps 기준
    const newTime = direction === 'forward' 
      ? Math.min(videoRef.current.currentTime + frameTime, duration)
      : Math.max(videoRef.current.currentTime - frameTime, 0);
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 시작 시점 선택
  const selectStartTime = () => {
    setStartTime(currentTime);
  };

  // 최고점 시점 선택
  const selectPeakTime = () => {
    setPeakTime(currentTime);
  };

  // 분석 완료
  const completeAnalysis = () => {
    if (startTime !== null && peakTime !== null) {
      const airTime = Math.abs(peakTime - startTime);
      onAnalysisComplete(startTime, peakTime, airTime);
    }
  };

  // 시간 포맷 (밀리초 단위)
  const formatTime = (time: number) => {
    return time.toFixed(2) + '초';
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">영상 분석</h3>
      
      {/* 비디오 플레이어 */}
      <div className="relative mb-6">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-w-2xl mx-auto rounded-lg bg-black"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* 시점 표시 오버레이 */}
        <div className="absolute top-4 left-4 space-y-2">
          {startTime !== null && (
            <div className="bg-green-500 text-white px-3 py-1 rounded text-sm">
              시작: {formatTime(startTime)}
            </div>
          )}
          {peakTime !== null && (
            <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
              최고점: {formatTime(peakTime)}
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        {/* 재생 컨트롤 */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => moveFrame('backward')}
            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
            title="이전 프레임"
          >
            ⏮️
          </button>
          
          <button
            onClick={togglePlayPause}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            {isPlaying ? '⏸️ 일시정지' : '▶️ 재생'}
          </button>
          
          <button
            onClick={() => moveFrame('forward')}
            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
            title="다음 프레임"
          >
            ⏭️
          </button>
        </div>

        {/* 시간 슬라이더 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>0.00초</span>
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.01"
            value={currentTime}
            onChange={handleTimeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 시점 선택 버튼 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={selectStartTime}
            className={`py-3 px-4 rounded-lg font-bold transition ${
              startTime !== null 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            🚀 시작 시점 선택
            {startTime !== null && (
              <div className="text-sm mt-1">{formatTime(startTime)}</div>
            )}
          </button>
          
          <button
            onClick={selectPeakTime}
            className={`py-3 px-4 rounded-lg font-bold transition ${
              peakTime !== null 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            ⬆️ 최고점 선택
            {peakTime !== null && (
              <div className="text-sm mt-1">{formatTime(peakTime)}</div>
            )}
          </button>
        </div>

        {/* 결과 및 완료 */}
        {startTime !== null && peakTime !== null && (
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-lg font-bold text-yellow-400 mb-2">
              체공시간: {formatTime(Math.abs(peakTime - startTime))}
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={completeAnalysis}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
              >
                ✅ 분석 완료
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                🔄 다시 촬영
              </button>
            </div>
          </div>
        )}

        {/* 취소 버튼 (시점 선택 전) */}
        {(startTime === null || peakTime === null) && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              🔄 다시 촬영
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
