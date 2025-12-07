'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { PushupType, PushupState, PushupConfig } from '@/types/pushup';
import { calculateAngle, startCameraStream, stopCameraStream } from '@/lib/pose-utils';
import { PUSHUP_CONFIGS } from '@/config/pushup-types';
import { playPushupCountSound } from '@/lib/sound-effects';
import { useMeasurementTimer, TimerStatus } from './measurement-timer';
import { MeasurementUI } from './measurement-ui';
import { CameraPermissionModal } from './camera-permission-modal';
import { EXERCISE_GUIDES } from '@/config/exercise-guides';
import { FONT_STYLES } from '@/styles/fontStyles';
import { addMeasurementCompletion } from '@/utils/measurement-storage';

interface PushupDetectorProps {
  type: PushupType;
  onBack?: () => void;
}

export function PushupDetector({ type, onBack }: PushupDetectorProps) {
  const config = PUSHUP_CONFIGS[type];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showCameraPermission, setShowCameraPermission] = useState(true);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [count, setCount] = useState(0);
  const [state, setState] = useState<PushupState>('ready');
  const [feedback, setFeedback] = useState('');
  const [leftElbowAngle, setLeftElbowAngle] = useState(0);
  const [rightElbowAngle, setRightElbowAngle] = useState(0);
  const [bodyAngle, setBodyAngle] = useState(0);
  
  // 타이머 상태
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [preparingTime, setPreparingTime] = useState(10);
  const [remainingTime, setRemainingTime] = useState(60);
  
  // 전신 감지 상태
  const [isFullBodyDetected, setIsFullBodyDetected] = useState(false);
  const isFullBodyDetectedRef = useRef(false);
  const fullBodyLostFramesRef = useRef(0);
  const FULL_BODY_LOST_THRESHOLD = 30;
  
  // 측정 완료 시 결과 저장
  const handleMeasurementComplete = () => {
    // 측정 결과를 localStorage에 저장
    const storageKey = `measurement_pushup_${type}`;
    localStorage.setItem(storageKey, count.toString());
    
    // 측정 완료 상태 저장
    addMeasurementCompletion('muscle');
    
    setFeedback(`측정 완료! ${count}개`);
  };

  // 타이머 hook 사용
  const { startMeasurement, resetTimer } = useMeasurementTimer({
    timerStatus,
    setTimerStatus,
    preparingTime,
    setPreparingTime,
    remainingTime,
    setRemainingTime,
    isFullBodyDetected,
    onTimerComplete: handleMeasurementComplete,
    prepareDuration: 10,
    measureDuration: 60,
  });

  const stateRef = useRef<PushupState>('ready');
  const downFrameCountRef = useRef(0);
  const upFrameCountRef = useRef(0);
  const downAngleRef = useRef(0); // DOWN 상태일 때의 최소 각도 기록

  // 타입별 임계값 (config에서 가져옴)
  const ELBOW_DOWN_THRESHOLD = config.thresholds.elbowDown;
  const ELBOW_UP_THRESHOLD = config.thresholds.elbowUp;
  const BODY_ALIGNMENT_MIN = config.thresholds.bodyAlignment;
  const FRAME_THRESHOLD = config.thresholds.frameThreshold;
  const ANGLE_CHANGE_MIN = config.thresholds.angleChangeMin;

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // MediaPipe 초기화
  useEffect(() => {
    if (!isMounted) return;

    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
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
        setFeedback('MediaPipe 로딩 실패');
        setIsLoading(false);
      }
    };

    initializePoseLandmarker();
  }, [isMounted]);

  // 카메라 권한 허용 후 자동 시작
  useEffect(() => {
    if (cameraPermissionGranted && videoRef.current && poseLandmarker) {
      console.log('Auto-starting camera after permission granted');
      startCamera();
    }
  }, [cameraPermissionGranted, poseLandmarker]);

  // 카메라 권한 처리
  const handleCameraPermissionGranted = () => {
    setShowCameraPermission(false);
    setCameraPermissionGranted(true);
    // 카메라 시작은 useEffect에서 처리
  };

  const handleCameraPermissionDenied = () => {
    setShowCameraPermission(false);
    if (onBack) {
      onBack();
    }
  };

  // 카메라 시작
  const startCamera = async () => {
    console.log("window ", window)
    console.log("videoRef.current ", videoRef.current)
    if (typeof window === 'undefined' || !videoRef.current) return;

    try {
      console.log("start camera gogo")
      await startCameraStream(videoRef.current, false); // 가로 비율 사용
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
    downAngleRef.current = 0;
    startMeasurement();
  };

  // 푸시업 인식 및 카운팅 (백그라운드 분석만)
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

        // 주요 포인트 추출 (양쪽 팔 모두)
        const leftShoulder = landmarks[11];
        const leftElbow = landmarks[13];
        const leftWrist = landmarks[15];
        const rightShoulder = landmarks[12];
        const rightElbow = landmarks[14];
        const rightWrist = landmarks[16];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];

        // 전신 감지 체크 (어깨, 엉덩이, 무릎, 발목의 visibility 확인)
        const keyPoints = [
          leftShoulder, rightShoulder,
          leftHip, rightHip,
          leftKnee, rightKnee,
          leftAnkle, rightAnkle
        ];
        
        // TODO: 전신 인식 기준 완화 - visibility 임계값을 0.5에서 0.3으로 낮춤
        const allPointsVisible = keyPoints.every(point => 
          point.visibility !== undefined && point.visibility > 0.3
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

        // 각도 계산 (양쪽 팔)
        const currentLeftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        const currentRightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        
        // 평균 팔꿈치 각도 사용 (더 안정적)
        const avgElbowAngle = (currentLeftElbowAngle + currentRightElbowAngle) / 2;
        
        // 몸통 각도 (어깨-엉덩이-무릎)
        const leftBodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
        const rightBodyAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
        const currentBodyAngle = (leftBodyAngle + rightBodyAngle) / 2;

        setLeftElbowAngle(currentLeftElbowAngle);
        setRightElbowAngle(currentRightElbowAngle);
        setBodyAngle(currentBodyAngle);

        // 디버깅 로그 (매 30프레임마다만 출력)
        if (Math.random() < 0.1) {
          console.log('=== 푸시업 디버깅 ===');
          console.log('팔꿈치 각도 - L:', currentLeftElbowAngle.toFixed(1), 'R:', currentRightElbowAngle.toFixed(1), 'Avg:', avgElbowAngle.toFixed(1));
          console.log('몸통 각도:', currentBodyAngle.toFixed(1));
          console.log('현재 상태:', stateRef.current);
          console.log('DOWN 프레임:', downFrameCountRef.current, '/ UP 프레임:', upFrameCountRef.current);
          console.log('임계값 - DOWN:', ELBOW_DOWN_THRESHOLD, '/ UP:', ELBOW_UP_THRESHOLD);
          console.log('몸 일직선?', currentBodyAngle > BODY_ALIGNMENT_MIN);
        }

        // 자세 체크
        const isBodyStraight = currentBodyAngle > BODY_ALIGNMENT_MIN;
        let newFeedback = '';
        let newState = stateRef.current;

        // 푸시업 로직 (측정 중일 때만 카운팅)
        
        // 측정 중일 때만 카운팅 (전신이 감지될 때만)
        if (timerStatus === 'measuring' && isFullBodyDetected) {
          // DOWN 감지: 팔꿈치가 임계값 이하 (팔을 구부림)
          if (avgElbowAngle < ELBOW_DOWN_THRESHOLD) {
            downFrameCountRef.current++;
            upFrameCountRef.current = 0;
            
            // DOWN 상태에서 최소 각도 기록
            if (stateRef.current === 'down') {
              downAngleRef.current = Math.min(downAngleRef.current, avgElbowAngle);
            }
            
            if (downFrameCountRef.current >= FRAME_THRESHOLD && stateRef.current !== 'down') {
              newState = 'down';
              downAngleRef.current = avgElbowAngle; // 초기 DOWN 각도 기록
              newFeedback = '💪 좋아요! 이제 올라오세요';
              console.log('✅ DOWN 상태 전환! 각도:', avgElbowAngle.toFixed(1));
            } else if (stateRef.current === 'down') {
              newFeedback = '💪 좋아요! 이제 올라오세요';
            } else {
              newFeedback = `더 내려가세요 (${avgElbowAngle.toFixed(0)}°)`;
            }
          } 
          // UP 감지: DOWN 상태에서 팔꿈치가 임계값 이상 + 충분한 각도 변화
          else if (avgElbowAngle > ELBOW_UP_THRESHOLD && stateRef.current === 'down') {
            const angleChange = avgElbowAngle - downAngleRef.current;
            upFrameCountRef.current++;
            downFrameCountRef.current = 0;
            
            // 충분한 각도 변화가 있어야 UP 인정
            if (upFrameCountRef.current >= FRAME_THRESHOLD && angleChange >= ANGLE_CHANGE_MIN) {
              newState = 'up';
              setCount(prev => prev + 1);
              playPushupCountSound(); // 푸시업 카운트 효과음
              newFeedback = '🎉 완벽합니다!';
              console.log(`✅ UP 완료! 각도 변화: ${downAngleRef.current.toFixed(1)}° → ${avgElbowAngle.toFixed(1)}° (${angleChange.toFixed(1)}°)`);
              downFrameCountRef.current = 0;
              upFrameCountRef.current = 0;
              downAngleRef.current = 0;
              
              // UP 상태는 즉시 ready로 전환
              setTimeout(() => {
                stateRef.current = 'ready';
                setState('ready');
              }, 500);
            } else if (angleChange < ANGLE_CHANGE_MIN) {
              newFeedback = `각도 변화 부족 (${angleChange.toFixed(0)}° / ${ANGLE_CHANGE_MIN}° 필요)`;
            } else {
              newFeedback = `계속 올라오세요 (${avgElbowAngle.toFixed(0)}°)`;
            }
          } 
          // 중간 각도
          else {
            // DOWN 상태가 아니면 프레임 카운터 리셋
            if (stateRef.current !== 'down') {
              downFrameCountRef.current = 0;
            }
            upFrameCountRef.current = 0;
            
            if (stateRef.current === 'ready' || stateRef.current === 'up') {
              if (!isBodyStraight) {
                newFeedback = '⚠️ 몸을 일직선으로 유지하세요';
              } else {
                newFeedback = '푸시업 자세를 취하세요';
              }
            } else if (stateRef.current === 'down') {
              newFeedback = `계속 올라오세요 (${avgElbowAngle.toFixed(0)}°)`;
            }
          }
        } else if (timerStatus === 'measuring' && !isFullBodyDetected) {
          // 전신 미감지시에는 피드백 표시 안함 (화면 상단 경고 배너로 충분)
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
        setFeedback('몸 전체가 화면에 보이도록 해주세요 (옆모습)');
        setIsFullBodyDetected(false);
        isFullBodyDetectedRef.current = false;
        fullBodyLostFramesRef.current = FULL_BODY_LOST_THRESHOLD + 1;
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  const handleSaveResult = () => {
    // TODO: 임시로 최소 10개 보장 - 실제 측정값이 10개 미만이면 10개로 설정
    const finalCount = Math.max(count, 10);
    
    // 측정 결과를 localStorage에 저장
    const storageKey = `measurement_pushup_${type}`;
    localStorage.setItem(storageKey, finalCount.toString());
    
    // 측정 완료 상태 저장
    addMeasurementCompletion('muscle');
    
    // measurement 페이지로 이동
    window.location.href = '/measurement';
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-50px)]">
      {/* 카메라 권한 요청 모달 */}
      <CameraPermissionModal
        isOpen={showCameraPermission}
        onPermissionGranted={handleCameraPermissionGranted}
        onPermissionDenied={handleCameraPermissionDenied}
        exerciseTitle={`${config.nameKo} 측정`}
      />

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-xl">MediaPipe 로딩 중...</div>
        </div>
      ) : !cameraPermissionGranted ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-xl">카메라 권한을 허용해주세요</div>
        </div>
      ) : (
        <MeasurementUI
          exerciseName={config.nameKo}
          videoRef={videoRef}
          isPortrait={false}
          timerStatus={timerStatus}
          preparingTime={preparingTime}
          remainingTime={remainingTime}
          count={count}
          isFullBodyDetected={isFullBodyDetected}
          feedback={feedback}
          state={state}
          instructions={
            <div className="bg-[#F5F5F5] p-4 rounded-[20px] flex flex-col gap-2">
             {/* TODO : EXERCISE_GUIDES.푸시업타입.precautions 추가*/}
             <p className={`${FONT_STYLES.body9} text-[#767676]`}>사용방법</p>
             <div className={`${FONT_STYLES.body10} text-[#767676] flex flex-col gap-1`}>{EXERCISE_GUIDES[`pushup-${type}`]?.instructions.map((instruction, index) => <p key={index}>{instruction}</p>)}</div>
            </div>
          }
          onStartCamera={startCamera}
          onStartMeasurement={handleStartMeasurement}
          onStopMeasurement={() => {
            // 측정 중단 시에는 리셋 로직 실행
            setCount(0);
            setState('ready');
            stateRef.current = 'ready';
            setFeedback('');
            downFrameCountRef.current = 0;
            upFrameCountRef.current = 0;
            downAngleRef.current = 0;
            resetTimer();
          }}
          onSaveResult={handleSaveResult}
          countLabel="푸시업 개수"
          timeLabel="남은 시간"
        />
      )}
    </div>
  );
}
