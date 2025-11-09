'use client';

import { useState, useRef, useEffect } from 'react';

// 제자리 높이뛰기 단계 정의
type StandingJumpPhase = 
  | 'intro'           // 시작 전 안내
  | 'recording'       // 영상 촬영 중
  | 'analysis'        // 영상 분석 (시점 선택)
  | 'result'          // 개별 결과 확인
  | 'final-result';   // 최종 결과 (3회 완료 후)

interface JumpRecord {
  videoBlob: Blob;
  startTime: number | null;
  peakTime: number | null;
  airTime: number | null;
}

interface StandingJumpProps {
  onBack?: () => void;
}

export function StandingJump({ onBack }: StandingJumpProps) {
  const [phase, setPhase] = useState<StandingJumpPhase>('intro');
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [records, setRecords] = useState<JumpRecord[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // 비디오 관련 refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // 타이머 관련 refs
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // 전면 카메라 (사용자가 자신을 보면서 점프)
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      alert('카메라 접근이 필요합니다. 브라우저 설정을 확인해주세요.');
    }
  };

  // 카메라 정지
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // 녹화 시작
  const startRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const newRecord: JumpRecord = {
        videoBlob: blob,
        startTime: null,
        peakTime: null,
        airTime: null
      };
      
      setRecords(prev => {
        const updated = [...prev];
        updated[currentAttempt - 1] = newRecord;
        return updated;
      });
      
      setPhase('analysis');
    };
    
    setIsRecording(true);
    setRecordingTime(0);
    mediaRecorder.start();
    
    // 10초 후 자동 정지
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 9) {
          stopRecording();
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // 녹화 정지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // 컴포넌트 마운트 시 카메라 시작
  useEffect(() => {
    if (phase === 'recording') {
      startCamera();
    }
    
    return () => {
      stopCamera();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [phase]);

  // 시간 포맷 함수
  const formatTime = (seconds: number) => {
    return `${seconds.toString().padStart(2, '0')}초`;
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
        <h1 className="text-xl font-bold flex-1 text-center">제자리 높이뛰기</h1>
        <div className="w-10"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {phase === 'intro' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">제자리 높이뛰기</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              최대 3회 측정하여 가장 긴 체공시간을 기록합니다.
              <br />
              영상을 촬영한 후 시작점과 최고점을 선택해주세요.
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mb-8">
              <h3 className="font-bold mb-2">측정 방법:</h3>
              <ul className="text-sm text-gray-300 text-left space-y-1">
                <li>• 양발을 어깨너비만큼 벌리고 선다</li>
                <li>• 팔과 몸으로 반동을 주며 최대한 높이 뛴다</li>
                <li>• 착지 시 양발이 모두 바닥에 있어야 한다</li>
              </ul>
            </div>
            <button
              onClick={() => setPhase('recording')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105"
            >
              {currentAttempt}회차 측정 시작
            </button>
          </div>
        )}

        {phase === 'recording' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">{currentAttempt}회차 촬영</h2>
            
            {/* 카메라 화면 */}
            <div className="relative mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-sm rounded-lg bg-black"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  REC {formatTime(recordingTime)}
                </div>
              )}
            </div>

            <p className="text-gray-300 mb-6">
              준비가 되면 녹화를 시작하고 제자리 높이뛰기를 해주세요.
              <br />
              (10초 후 자동 정지됩니다)
            </p>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105"
              >
                🔴 녹화 시작
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                녹화 중지
              </button>
            )}
          </div>
        )}

        {phase === 'analysis' && (
          <div className="text-center max-w-2xl w-full">
            <h2 className="text-3xl font-bold mb-6">{currentAttempt}회차 분석</h2>
            <p className="text-gray-300 mb-6">
              영상에서 (1) 발이 떨어지는 시점과 (2) 가장 높은 시점을 선택해주세요.
            </p>
            
            {/* 여기에 영상 분석 UI가 들어갈 예정 */}
            <div className="bg-gray-800 p-8 rounded-lg">
              <p className="text-gray-400">영상 분석 UI 구현 예정</p>
              
              {/* 임시 버튼 */}
              <button
                onClick={() => {
                  // 임시로 다음 단계로 이동
                  if (currentAttempt < 3) {
                    setCurrentAttempt(prev => prev + 1);
                    setPhase('intro');
                  } else {
                    setPhase('final-result');
                  }
                }}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                임시: 다음 단계
              </button>
            </div>
          </div>
        )}

        {phase === 'final-result' && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-8">측정 완료</h2>
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <div className="text-gray-400 text-sm mb-4">3회 측정 결과</div>
              {/* 결과 표시 예정 */}
              <div className="text-2xl font-bold text-green-400">
                최고 기록: 0.00초
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
