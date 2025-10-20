'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [state, setState] = useState<SitupState>('ready');
  const [feedback, setFeedback] = useState('');
  const [bodyAngle, setBodyAngle] = useState(0);
  const [kneeElbowDistance, setKneeElbowDistance] = useState(0);
  
  // 타이머 상태
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [preparingTime, setPreparingTime] = useState(10);
  const [remainingTime, setRemainingTime] = useState(60);
  
  // 전신 감지 상태
  const [isFullBodyDetected, setIsFullBodyDetected] = useState(false);
  const isFullBodyDetectedRef = useRef(false);
  const fullBodyLostFramesRef = useRef(0);
  const FULL_BODY_LOST_THRESHOLD = 30;
  
  // 화면 표시 모드
  const [showSkeleton, setShowSkeleton] = useState(true);
  
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

  // 거리 계산 함수
  const calculateDistance = (point1: any, point2: any) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 싯업 인식 및 카운팅
  const detectPose = () => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarker) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let lastVideoTime = -1;

    const detect = async () => {
      if (video.currentTime === lastVideoTime) {
        requestAnimationFrame(detect);
        return;
      }
      lastVideoTime = video.currentTime;

      const results = poseLandmarker.detectForVideo(video, performance.now());

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // 골격 그리기
        const drawingUtils = new DrawingUtils(ctx);
        drawingUtils.drawLandmarks(landmarks, {
          radius: (data: any) => {
            // 주요 포인트는 크게
            if ([11, 12, 13, 14, 23, 24, 25, 26].includes(data.index)) return 6;
            return 2;
          },
        });
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS
        );

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

        // 팔꿈치와 무릎 사이의 거리 계산 (가장 가까운 거리)
        const leftDistance = calculateDistance(leftElbow, leftKnee) * canvas.width;
        const rightDistance = calculateDistance(rightElbow, rightKnee) * canvas.width;
        const minDistance = Math.min(leftDistance, rightDistance);
        setKneeElbowDistance(minDistance);

        // 디버깅 로그
        if (Math.random() < 0.1) {
          console.log('=== 싯업 디버깅 ===');
          console.log('상체 각도:', currentBodyAngle.toFixed(1));
          console.log('팔꿈치-무릎 거리:', minDistance.toFixed(1));
          console.log('현재 상태:', stateRef.current);
          console.log('DOWN 프레임:', downFrameCountRef.current, '/ UP 프레임:', upFrameCountRef.current);
        }

        let newFeedback = '';
        let newState = stateRef.current;

        // 싯업 로직 (측정 중일 때만 카운팅)
        if (timerStatus === 'measuring' && isFullBodyDetected) {
          // UP 감지: 팔꿈치가 무릎에 가까워짐 + 상체 각도 증가
          if (minDistance < KNEE_ELBOW_DISTANCE_THRESHOLD && currentBodyAngle > BODY_ANGLE_THRESHOLD) {
            upFrameCountRef.current++;
            downFrameCountRef.current = 0;
            
            if (upFrameCountRef.current >= FRAME_THRESHOLD && stateRef.current !== 'up') {
              newState = 'up';
              setCount(prev => prev + 1);
              playPushupCountSound(); // 싯업 카운트 효과음
              newFeedback = '🎉 완벽합니다!';
              console.log('✅ UP 완료! 각도:', currentBodyAngle.toFixed(1), '거리:', minDistance.toFixed(1));
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
          // DOWN 감지: 누워있는 상태 (상체 각도 낮음)
          else if (currentBodyAngle < BODY_ANGLE_THRESHOLD) {
            downFrameCountRef.current++;
            upFrameCountRef.current = 0;
            
            if (downFrameCountRef.current >= FRAME_THRESHOLD && stateRef.current !== 'down') {
              newState = 'down';
              newFeedback = '💪 좋아요! 이제 올라오세요';
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

        // 각도 표시
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        
        const angleText = `상체 각도: ${currentBodyAngle.toFixed(0)}°`;
        ctx.strokeText(angleText, 10, 30);
        ctx.fillText(angleText, 10, 30);

        const distanceText = `팔꿈치-무릎 거리: ${minDistance.toFixed(0)}px`;
        ctx.strokeText(distanceText, 10, 60);
        ctx.fillText(distanceText, 10, 60);

        const stateText = `상태: ${stateRef.current.toUpperCase()}`;
        ctx.strokeText(stateText, 10, 90);
        ctx.fillText(stateText, 10, 90);

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
          canvasRef={canvasRef}
          showSkeleton={showSkeleton}
          setShowSkeleton={setShowSkeleton}
          timerStatus={timerStatus}
          preparingTime={preparingTime}
          remainingTime={remainingTime}
          count={count}
          isFullBodyDetected={isFullBodyDetected}
          feedback={feedback}
          state={state}
          additionalInfo={
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
          }
          instructions={
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold text-white mb-2">💡 사용 방법:</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <li><strong className="text-white">정면</strong>이 보이도록 카메라를 설치하세요</li>
                <li>무릎을 세우고 누워서 <strong className="text-white">팔꿈치가 무릎에 닿도록</strong> 상체를 올리세요</li>
                <li>상체 각도가 <strong className="text-white">{BODY_ANGLE_THRESHOLD}도 이상</strong>이고 팔꿈치가 무릎에 가까워지면 카운트!</li>
                <li>{config.description}</li>
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
