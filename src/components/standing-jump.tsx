'use client';

import { useState, useRef, useEffect } from 'react';
import { VideoAnalyzer } from './video-analyzer';

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showJumpMessage, setShowJumpMessage] = useState(false);
  
  // 비디오 관련 refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // 타이머 관련 refs
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // 전면 카메라 (사용자가 자신을 보면서 점프)
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, min: 30 } // 고프레임레이트로 정확도 향상
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

  // 비프음 생성
  const playBeep = (frequency: number = 800, duration: number = 200) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  // 카운트다운과 함께 녹화 시작
  const startCountdownAndRecording = () => {
    if (!streamRef.current) return;

    // 3초 카운트다운 시작
    setCountdown(3);
    playBeep(600, 200); // 낮은 음

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        
        if (prev > 1) {
          playBeep(600, 200); // 카운트다운 음
          return prev - 1;
        } else {
          // 카운트다운 완료, 녹화 시작
          clearInterval(countdownTimerRef.current!);
          setCountdown(null);
          setShowJumpMessage(true);
          playBeep(1000, 500); // 높은 시작 음
          
          // 실제 녹화 시작
          startActualRecording();
          
          // 2초 후 "뛰세요" 메시지 숨김
          setTimeout(() => {
            setShowJumpMessage(false);
          }, 2000);
          
          return null;
        }
      });
    }, 1000);
  };

  // 실제 녹화 시작
  const startActualRecording = () => {
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
    
    // 3초 후 자동 정지
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 2) {
          stopRecording();
          return 3;
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
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
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
              onClick={() => {
                setPhase('recording');
                // 카메라 시작 후 바로 카운트다운 시작
                setTimeout(() => {
                  startCountdownAndRecording();
                }, 500); // 카메라 초기화 대기
              }}
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
              
              {/* 카운트다운 오버레이 */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-8xl font-bold text-white animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
              
              {/* "뛰세요" 메시지 오버레이 */}
              {showJumpMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-6xl font-bold text-green-400 animate-bounce">
                    뛰세요!
                  </div>
                </div>
              )}
              
              {/* 녹화 상태 표시 */}
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  REC {formatTime(recordingTime)}
                </div>
              )}
            </div>

            {countdown !== null ? (
              <p className="text-gray-300 mb-6">
                준비하세요! 카운트다운이 끝나면 제자리 높이뛰기를 해주세요.
              </p>
            ) : isRecording ? (
              <p className="text-gray-300 mb-6">
                녹화 중입니다. 최대한 높이 뛰어주세요!
                <br />
                (자동으로 정지됩니다)
              </p>
            ) : (
              <p className="text-gray-300 mb-6">
                카메라를 준비하고 있습니다...
              </p>
            )}

            {/* 녹화 중지 버튼 (필요시) */}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                녹화 중지
              </button>
            )}
          </div>
        )}

        {phase === 'analysis' && records[currentAttempt - 1] && (
          <div className="w-full max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">{currentAttempt}회차 분석</h2>
            <p className="text-gray-300 mb-6 text-center">
              영상에서 (1) 발이 떨어지는 시점과 (2) 가장 높은 시점을 선택해주세요.
            </p>
            
            <VideoAnalyzer
              videoBlob={records[currentAttempt - 1].videoBlob}
              onAnalysisComplete={(startTime, peakTime, airTime) => {
                // 분석 결과 저장
                setRecords(prev => {
                  const updated = [...prev];
                  updated[currentAttempt - 1] = {
                    ...updated[currentAttempt - 1],
                    startTime,
                    peakTime,
                    airTime
                  };
                  return updated;
                });
                
                setPhase('result');
              }}
              onCancel={() => {
                // 다시 촬영
                setPhase('recording');
              }}
            />
          </div>
        )}

        {phase === 'result' && records[currentAttempt - 1] && (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-6">{currentAttempt}회차 결과</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <div className="text-4xl font-bold text-green-400 mb-4">
                {records[currentAttempt - 1].airTime?.toFixed(2)}초
              </div>
              <div className="text-gray-400 text-sm space-y-1">
                <div>시작: {records[currentAttempt - 1].startTime?.toFixed(2)}초</div>
                <div>최고점: {records[currentAttempt - 1].peakTime?.toFixed(2)}초</div>
              </div>
            </div>

            {currentAttempt < 3 ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setCurrentAttempt(prev => prev + 1);
                    setPhase('intro');
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
                  record.airTime !== null && (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{index + 1}회차:</span>
                      <span className="font-mono text-lg">
                        {record.airTime.toFixed(2)}초
                      </span>
                    </div>
                  )
                ))}
              </div>
              
              {/* 최고 기록 */}
              <div className="border-t border-gray-600 pt-4">
                <div className="text-gray-400 text-sm">최고 기록</div>
                <div className="text-3xl font-bold text-green-400">
                  {Math.max(...records.filter(r => r.airTime !== null).map(r => r.airTime!)).toFixed(2)}초
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  // 다시 측정
                  setCurrentAttempt(1);
                  setRecords([]);
                  setPhase('intro');
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
