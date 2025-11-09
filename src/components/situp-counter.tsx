'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { SitupState, SitupConfig, SITUP_CONFIG } from '@/types/situp';
import { calculateAngle, startCameraStream, stopCameraStream } from '@/lib/pose-utils';
import { playPushupCountSound } from '@/lib/sound-effects';
import { useMeasurementTimer, TimerStatus } from './measurement-timer';
import { MeasurementUI } from './measurement-ui';

interface SitupDetectorProps {
  onBack?: () => void;
}

export function SitupDetector({ onBack }: SitupDetectorProps) {
  const config = SITUP_CONFIG;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [state, setState] = useState<SitupState>('ready');
  const [feedback, setFeedback] = useState('');
  const [bodyAngle, setBodyAngle] = useState(0);
  const [kneeElbowDistance, setKneeElbowDistance] = useState(0);
  
  // 디버깅 로그 상태
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // 타이머 상태
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [preparingTime, setPreparingTime] = useState(10);
  const [remainingTime, setRemainingTime] = useState(60);
  
  // 전신 감지 상태
  const [isFullBodyDetected, setIsFullBodyDetected] = useState(false);
  const isFullBodyDetectedRef = useRef(false);
  const fullBodyLostFramesRef = useRef(0);
  const FULL_BODY_LOST_THRESHOLD = 30;
  
  // 타이머 hook 사용
  const { startMeasurement, resetTimer } = useMeasurementTimer({
    timerStatus,
    setTimerStatus,
    preparingTime,
    setPreparingTime,
    remainingTime,
    setRemainingTime,
    isFullBodyDetected,
    onTimerComplete: () => setFeedback('측정 완료!'),
    prepareDuration: 10,
    measureDuration: 60,
  });

  const stateRef = useRef<SitupState>('ready');
  const downFrameCountRef = useRef(0);
  const upFrameCountRef = useRef(0);
  const FRAME_THRESHOLD = 5; // 5프레임 연속으로 조건 만족해야 상태 변경

  // 임계값
  const KNEE_ELBOW_DISTANCE_THRESHOLD = config.thresholds.kneeElbowDistance;
  const BODY_ANGLE_THRESHOLD = config.thresholds.bodyAngle;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // MediaPipe 초기화
  useEffect(() => {
    if (!isMounted) return;

    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1
        });
        
        setPoseLandmarker(landmarker);
        setIsLoading(false);
      } catch (error) {
        console.error('MediaPipe 초기화 실패:', error);
        setIsLoading(false);
      }
    };

    initializePoseLandmarker();
  }, [isMounted]);

  // 카메라 시작
  const startCamera = async () => {
    if (typeof window === 'undefined' || !videoRef.current) return;

    try {
      await startCameraStream(videoRef.current);
      detectPose();
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      setFeedback('카메라 권한이 필요합니다');
    }
  };

  // 측정 시작 핸들러
  const handleStartMeasurement = () => {
    setCount(0);
    setState('ready');
    stateRef.current = 'ready';
    downFrameCountRef.current = 0;
    upFrameCountRef.current = 0;
    startMeasurement();
  };


  // 싯업 인식 및 카운팅 (백그라운드 분석만)
  const detectPose = () => {
    if (!videoRef.current || !poseLandmarker) return;

    const video = videoRef.current;
    let lastVideoTime = -1;

    const detect = async () => {
      if (video.currentTime === lastVideoTime) {
        requestAnimationFrame(detect);
        return;
      }
      lastVideoTime = video.currentTime;

      const results = poseLandmarker.detectForVideo(video, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // 주요 포인트 추출
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];

        // 전신 감지 체크
        const keyPoints = [
          leftShoulder, rightShoulder,
          leftElbow, rightElbow,
          leftHip, rightHip,
          leftKnee, rightKnee,
          leftAnkle, rightAnkle
        ];
        
        const allPointsVisible = keyPoints.every(point => 
          point.visibility !== undefined && point.visibility > 0.5
        );
        
        if (allPointsVisible) {
          fullBodyLostFramesRef.current = 0;
          setIsFullBodyDetected(true);
          isFullBodyDetectedRef.current = true;
        } else {
          fullBodyLostFramesRef.current++;
          if (fullBodyLostFramesRef.current > FULL_BODY_LOST_THRESHOLD) {
            setIsFullBodyDetected(false);
            isFullBodyDetectedRef.current = false;
          }
        }

        // 상체 각도 계산 (어깨-엉덩이-무릎)
        const shoulder = {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: (leftShoulder.y + rightShoulder.y) / 2
        };
        const hip = {
          x: (leftHip.x + rightHip.x) / 2,
          y: (leftHip.y + rightHip.y) / 2
        };
        const knee = {
          x: (leftKnee.x + rightKnee.x) / 2,
          y: (leftKnee.y + rightKnee.y) / 2
        };

        const currentBodyAngle = calculateAngle(shoulder, hip, knee);
        setBodyAngle(currentBodyAngle);

        // 팔꿈치와 무릎 사이의 거리 계산 (더 잘 보이는 쪽 사용)
        let elbowX, elbowY, kneeX, kneeY;
        if (leftElbow.visibility > rightElbow.visibility) {
          elbowX = leftElbow.x;
          elbowY = leftElbow.y;
          kneeX = leftKnee.x;
          kneeY = leftKnee.y;
        } else {
          elbowX = rightElbow.x;
          elbowY = rightElbow.y;
          kneeX = rightKnee.x;
          kneeY = rightKnee.y;
        }
        
        // 2D 유클리드 거리 계산
        const deltaX = (elbowX - kneeX) * video.videoWidth;
        const deltaY = (elbowY - kneeY) * video.videoHeight;
        const elbowKneeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        setKneeElbowDistance(elbowKneeDistance);

        // 디버깅 로그 추가 함수
        const addDebugLog = (message: string) => {
          const timestamp = new Date().toLocaleTimeString();
          const logMessage = `[${timestamp}] ${message}`;
          setDebugLogs(prev => {
            const newLogs = [logMessage, ...prev];
            return newLogs.slice(0, 10); // 최대 10개 로그만 유지
          });
        };

        // 디버깅 로그
        if (Math.random() < 0.3) {
          console.log('=== 싯업 디버깅 ===');
          console.log('상체 각도:', currentBodyAngle.toFixed(1));
          console.log('팔꿈치-무릎 거리:', elbowKneeDistance.toFixed(1));
          console.log('현재 상태:', stateRef.current);
          console.log('DOWN 프레임:', downFrameCountRef.current, '/ UP 프레임:', upFrameCountRef.current);
          
          // 실시간 로그 추가
          addDebugLog(`📊 실시간: 각도=${currentBodyAngle.toFixed(1)}°, 거리=${elbowKneeDistance.toFixed(1)}px`);
        }

        let newFeedback = '';
        let newState = stateRef.current;

        // 측면 자세 체크 (어깨 visibility와 간격으로 판단)
        const leftShoulderVisible = leftShoulder.visibility > 0.5;
        const rightShoulderVisible = rightShoulder.visibility > 0.5;
        const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);
        
        // 측면 자세 판단: 한쪽 어깨만 보이거나, 둘 다 보이지만 매우 가까운 경우
        const isSideView = (!leftShoulderVisible || !rightShoulderVisible) || 
                          (leftShoulderVisible && rightShoulderVisible && shoulderDistance < 0.1);
        
        // 조건별 상세 체크
        const isDistanceOk = elbowKneeDistance < KNEE_ELBOW_DISTANCE_THRESHOLD;
        const isAngleOk = currentBodyAngle < BODY_ANGLE_THRESHOLD;
        const isDownAngle = currentBodyAngle > 110;
        
        // 상세 디버깅 로그 (항상 출력)
        if (timerStatus === 'measuring' && isFullBodyDetected) {
          addDebugLog(`🔍 조건체크: 측면=${isSideView}(L어깨:${leftShoulderVisible}, R어깨:${rightShoulderVisible}, 간격:${shoulderDistance.toFixed(3)}), 거리=${isDistanceOk}(${elbowKneeDistance.toFixed(0)}/${KNEE_ELBOW_DISTANCE_THRESHOLD}), 각도=${isAngleOk}(${currentBodyAngle.toFixed(0)}/${BODY_ANGLE_THRESHOLD}), DOWN각도=${isDownAngle}`);
        }

        // 싯업 로직 (측정 중일 때만 카운팅)
        if (timerStatus === 'measuring' && isFullBodyDetected) {
          // 측면 자세가 아니면 경고
          if (!isSideView) {
            newFeedback = '⚠️ 측면으로 누워주세요! (옆모습이 보이도록)';
            addDebugLog(`⚠️ 측면 자세 필요! 어깨간격: ${shoulderDistance.toFixed(3)}`);
          }
          // UP 감지: 측면 자세 + 팔꿈치가 무릎에 가까워짐 + 상체 각도가 낮아짐
          else if (isSideView && isDistanceOk && isAngleOk) {
            upFrameCountRef.current++;
            downFrameCountRef.current = 0;
            
            // UP 조건 만족 시 프레임 카운트 로그
            addDebugLog(`🔄 UP 조건 만족! 프레임: ${upFrameCountRef.current}/${FRAME_THRESHOLD}, 상태: ${stateRef.current}`);
            
            if (upFrameCountRef.current >= FRAME_THRESHOLD && stateRef.current !== 'up') {
              newState = 'up';
              setCount(prev => prev + 1);
              playPushupCountSound(); // 싯업 카운트 효과음
              newFeedback = '🎉 완벽합니다!';
              console.log('✅ UP 완료! 각도:', currentBodyAngle.toFixed(1), '거리:', elbowKneeDistance.toFixed(1));
              addDebugLog(`✅ UP 카운트! 각도: ${currentBodyAngle.toFixed(1)}°, 거리: ${elbowKneeDistance.toFixed(1)}px`);
              downFrameCountRef.current = 0;
              upFrameCountRef.current = 0;
              
              // UP 상태는 즉시 ready로 전환
              setTimeout(() => {
                stateRef.current = 'ready';
                setState('ready');
              }, 500);
            } else if (stateRef.current === 'up') {
              newFeedback = '🎉 완벽합니다!';
            } else {
              newFeedback = '계속 올라오세요!';
            }
          } 
          // DOWN 감지: 측면 자세 + 누워있는 상태 (상체 각도 높음 - 110도 이상)
          else if (isSideView && isDownAngle) {
            downFrameCountRef.current++;
            upFrameCountRef.current = 0;
            
            addDebugLog(`📍 DOWN 조건 만족! 프레임: ${downFrameCountRef.current}/${FRAME_THRESHOLD}, 상태: ${stateRef.current}`);
            
            if (downFrameCountRef.current >= FRAME_THRESHOLD && stateRef.current !== 'down') {
              newState = 'down';
              newFeedback = '💪 좋아요! 이제 올라오세요';
              addDebugLog(`📍 DOWN 준비! 각도: ${currentBodyAngle.toFixed(1)}°, 거리: ${elbowKneeDistance.toFixed(1)}px`);
              console.log('✅ DOWN 상태 전환! 각도:', currentBodyAngle.toFixed(1));
            } else if (stateRef.current === 'down') {
              newFeedback = '💪 좋아요! 이제 올라오세요';
            } else {
              newFeedback = '누워서 준비하세요';
            }
          }
          // 중간 상태
          else {
            if (stateRef.current !== 'down') {
              downFrameCountRef.current = 0;
            }
            upFrameCountRef.current = 0;
            
            if (stateRef.current === 'ready' || stateRef.current === 'up') {
              newFeedback = '싯업 자세를 취하세요';
            } else if (stateRef.current === 'down') {
              newFeedback = `팔꿈치를 무릎에 터치하세요`;
            }
          }
        } else if (timerStatus === 'measuring' && !isFullBodyDetected) {
          newFeedback = '';
        } else if (timerStatus === 'preparing') {
          newFeedback = '준비 중...';
        } else if (timerStatus === 'finished') {
          newFeedback = '측정 완료!';
        } else {
          newFeedback = '측정 시작 버튼을 눌러주세요';
        }

        if (newState !== stateRef.current) {
          stateRef.current = newState;
          setState(newState);
        }
        setFeedback(newFeedback);

      } else {
        setFeedback('몸 전체가 화면에 보이도록 해주세요');
        setIsFullBodyDetected(false);
        isFullBodyDetectedRef.current = false;
        fullBodyLostFramesRef.current = FULL_BODY_LOST_THRESHOLD + 1;
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  const handleReset = () => {
    setCount(0);
    setState('ready');
    stateRef.current = 'ready';
    setFeedback('');
    downFrameCountRef.current = 0;
    upFrameCountRef.current = 0;
    setDebugLogs([]); // 로그도 초기화
    resetTimer();
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-xl">MediaPipe 로딩 중...</div>
        </div>
      ) : (
        <MeasurementUI
          videoRef={videoRef}
          timerStatus={timerStatus}
          preparingTime={preparingTime}
          remainingTime={remainingTime}
          count={count}
          isFullBodyDetected={isFullBodyDetected}
          feedback={feedback}
          state={state}
          additionalInfo={
            <>
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">상체 각도</span>
                  <span className="text-2xl font-bold text-green-400">{Math.round(bodyAngle)}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">팔꿈치-무릎 거리</span>
                  <span className="text-2xl font-bold text-yellow-400">{Math.round(kneeElbowDistance)}px</span>
                </div>
              </div>
              
              {/* 디버깅 로그 박스 */}
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="font-semibold text-white mb-2">🔍 디버깅 로그</div>
                <div className="bg-gray-900 p-3 rounded max-h-32 overflow-y-auto">
                  {debugLogs.length === 0 ? (
                    <div className="text-gray-500 text-sm">로그가 없습니다</div>
                  ) : (
                    debugLogs.map((log, index) => (
                      <div key={index} className="text-xs text-gray-300 mb-1 font-mono">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          }
          instructions={
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold text-white mb-2">💡 사용 방법:</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <li><strong className="text-white">옆모습</strong>이 보이도록 카메라를 옆에 설치하세요</li>
                <li><strong className="text-white">측정 시작 전</strong> 양손을 뻗어 전신을 인식시키세요</li>
                <li><strong className="text-white">바닥에 누워서</strong> 무릎을 세우고 시작하세요</li>
                <li>상체를 올려 <strong className="text-white">팔꿈치가 무릎에 닿도록</strong> 하세요</li>
                <li>한쪽 팔다리만 보여도 측정 가능합니다</li>
                <li><strong className="text-white">측면 자세</strong> + 상체 각도 <strong className="text-white">{BODY_ANGLE_THRESHOLD}도 이하</strong> + 팔꿈치-무릎 거리 <strong className="text-white">{KNEE_ELBOW_DISTANCE_THRESHOLD}px 이하</strong>면 카운트!</li>
              </ul>
            </div>
          }
          onStartCamera={startCamera}
          onStartMeasurement={handleStartMeasurement}
          onStopMeasurement={handleReset}
          onReset={handleReset}
          countLabel="싯업 개수"
          timeLabel="남은 시간"
        />
      )}
    </div>
  );
}
