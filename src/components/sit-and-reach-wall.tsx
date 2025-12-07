'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { MeasurementUI } from './measurement-ui';
import { CameraPermissionModal } from './camera-permission-modal';
import { EXERCISE_GUIDES } from '@/config/exercise-guides';
import { FONT_STYLES } from '@/styles/fontStyles';
import { useMember } from '@/api/mypage/useMypage';
import { addMeasurementCompletion } from '@/utils/measurement-storage';

interface WallMeasurement {
  wallPosition: number;
  heelPosition: { x: number; y: number };
  fingerPosition: { x: number; y: number };
  distanceInPixels: number;
  distanceInCm: number;
  holdDuration: number;
  isValidPosture: boolean;
}

enum MeasurementPhase {
  SETUP = 'setup',
  HEIGHT_CALIBRATION = 'height_calibration', // 키 기반 캘리브레이션
  STANDING_MEASUREMENT = 'standing_measurement', // 서서 전신 측정
  VOICE_GUIDANCE = 'voice_guidance', // 음성 안내
  SITTING_MEASUREMENT = 'sitting_measurement', // 앉아서 측정
  RESULT = 'result'
}

const POSE_LANDMARKS = {
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12
};

export function SitAndReachWall() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showCameraPermission, setShowCameraPermission] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<MeasurementPhase>(MeasurementPhase.SETUP);
  const [measurement, setMeasurement] = useState<WallMeasurement | null>(null);
  const [bestMeasurement, setBestMeasurement] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [pixelToRealRatio, setPixelToRealRatio] = useState<number>(0.1); // 기본값: 1픽셀 = 0.1cm
  const [wallPosition, setWallPosition] = useState<number>(100); // 화면에서 벽의 x 좌표
  const [userHeight,setHeight] = useState<number>(170); // 사용자 키 (cm) - 기본값 또는 프로필에서 가져옴
  const [isHeightCalibrated, setIsHeightCalibrated] = useState<boolean>(false);
  const [voiceGuidanceTimer, setVoiceGuidanceTimer] = useState<number>(0);
  const [isUserSitting, setIsUserSitting] = useState<boolean>(false);
  
  const {data} = useMember();
  useEffect(()=>{
    setHeight(data?.height || 170) // 기본값 170cm 제공
  },[data])
  
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null);
  const [currentHoldTime, setCurrentHoldTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('측정 시작 버튼을 눌러주세요');
  const [preparingTime] = useState<number>(10);
  const [remainingTime] = useState<number>(60);
  
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cleanupDetectionRef = useRef<(() => void) | null>(null);

  const initializePoseLandmarker = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });

      poseLandmarkerRef.current = poseLandmarker;
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to initialize PoseLandmarker:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize PoseLandmarker');
      setIsLoading(false);
      return false;
    }
  };

  // 카메라 권한 처리
  const handleCameraPermissionGranted = () => {
    setShowCameraPermission(false);
    setCameraPermissionGranted(true);
    // 카메라 시작은 useEffect에서 처리
  };

  const handleCameraPermissionDenied = () => {
    setShowCameraPermission(false);
    // 뒤로 가기 또는 홈으로 이동하는 로직 추가 가능
  };

  // 카메라 권한 모달에서 허용 후 자동 시작 (fallback)
  useEffect(() => {
    if (cameraPermissionGranted && videoRef.current && poseLandmarker && !isActive) {
      console.log('Auto-starting camera after permission granted via modal');
      startCamera();
      setIsActive(true);
      startMeasurement();
    }
  }, [cameraPermissionGranted, poseLandmarker, isActive]);

  const startCamera = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera not supported in this browser');
        return;
      }

      // 화면 방향 잠금 시도 (모바일에서)
      if ('screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation) {
        try {
          await (window.screen.orientation as any).lock('portrait');
        } catch (err) {
          console.log('Screen orientation lock not supported or failed:', err);
        }
      }


      // 여러 해상도 시도
      let stream;
      const portraitConfigs = [
        // 첫 번째 시도: 정확한 세로 해상도
        {
          video: {
            facingMode: 'user',
            width: { exact: 480 },
            height: { exact: 640 }
          },
          audio: false
        },
        // 두 번째 시도: 이상적인 세로 해상도
        {
          video: {
            facingMode: 'user',
            width: { ideal: 480 },
            height: { ideal: 640 },
            aspectRatio: { ideal: 0.75 }
          },
          audio: false
        },
        // 세 번째 시도: 기본 설정
        {
          video: {
            facingMode: 'user'
          },
          audio: false
        }
      ];

      for (const config of portraitConfigs) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(config);
          console.log('Camera started with config:', config);
          break;
        } catch (err) {
          console.log('Failed with config:', config, err);
          continue;
        }
      }

      if (!stream) {
        throw new Error('Could not start camera with any configuration');
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              // 실제 비디오 해상도 확인
              const video = videoRef.current!;
              console.log('Video dimensions:', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                aspectRatio: video.videoWidth / video.videoHeight
              });
              
              // 스트림 트랙 정보 확인
              const videoTrack = stream.getVideoTracks()[0];
              if (videoTrack) {
                const settings = videoTrack.getSettings();
                console.log('Video track settings:', settings);
              }
              
              resolve();
            };
          }
        });
        
        await videoRef.current.play();
        
        // MediaPipe 초기화 확인
        if (!poseLandmarkerRef.current) {
          console.log('MediaPipe 초기화 대기 중...');
          await initializePoseLandmarker();
        }
        
        const cleanup = detectPose();
        cleanupDetectionRef.current = cleanup || null;
        
        // 카메라 시작 후 피드백 업데이트 (강제로)
        setTimeout(() => {
          setFeedback('카메라가 시작되었습니다. 측정 시작 버튼을 눌러주세요.');
        }, 100);
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError(`Failed to access camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [setError]);

  const stopCamera = () => {
    if (cleanupDetectionRef.current) {
      cleanupDetectionRef.current();
      cleanupDetectionRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const validatePosture = (landmarks: any[]) => {
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftHeel = landmarks[POSE_LANDMARKS.LEFT_HEEL];
    const rightHeel = landmarks[POSE_LANDMARKS.RIGHT_HEEL];

    if (!leftKnee || !rightKnee || !leftHip || !rightHip || !leftHeel || !rightHeel) {
      return false;
    }

    // 무릎이 펴져 있는지 확인 (각도 계산)
    const leftLegAngle = Math.abs(Math.atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x) - 
                                 Math.atan2(leftHeel.y - leftKnee.y, leftHeel.x - leftKnee.x));
    const rightLegAngle = Math.abs(Math.atan2(rightKnee.y - rightHip.y, rightKnee.x - rightHip.x) - 
                                  Math.atan2(rightHeel.y - rightKnee.y, rightHeel.x - rightKnee.x));

    // 각도가 일정 범위 내에 있으면 다리가 펴진 것으로 판단
    const isLeftLegStraight = leftLegAngle < 0.3; // 약 17도
    const isRightLegStraight = rightLegAngle < 0.3;

    return isLeftLegStraight && isRightLegStraight;
  };

  const calculateWallDistance = (landmarks: any[]) => {
    const leftHeel = landmarks[POSE_LANDMARKS.LEFT_HEEL];
    const rightHeel = landmarks[POSE_LANDMARKS.RIGHT_HEEL];
    const leftFinger = landmarks[POSE_LANDMARKS.LEFT_INDEX];
    const rightFinger = landmarks[POSE_LANDMARKS.RIGHT_INDEX];

    if (!leftHeel || !rightHeel || !leftFinger || !rightFinger) {
      return null;
    }

    // 발뒤꿈치 중점
    const heelMidpoint = {
      x: (leftHeel.x + rightHeel.x) / 2,
      y: (leftHeel.y + rightHeel.y) / 2
    };

    // 손끝 중점
    const fingerMidpoint = {
      x: (leftFinger.x + rightFinger.x) / 2,
      y: (leftFinger.y + rightFinger.y) / 2
    };

    // 벽에서 발뒤꿈치까지의 거리 (픽셀)
    const pixelDistance = Math.abs(heelMidpoint.x * 640 - wallPosition);
    const realDistance = pixelDistance * pixelToRealRatio;

    return {
      wallPosition,
      heelPosition: heelMidpoint,
      fingerPosition: fingerMidpoint,
      distanceInPixels: pixelDistance,
      distanceInCm: realDistance,
      holdDuration: currentHoldTime,
      isValidPosture: validatePosture(landmarks)
    };
  };

  const detectPose = () => {
    if (!videoRef.current || !poseLandmarkerRef.current) {
      return;
    }

    const video = videoRef.current;
    let isRunning = true;
    let lastVideoTime = -1;

    const detect = async () => {
      if (!isRunning || !video || !poseLandmarkerRef.current) return;

      if (video.currentTime === lastVideoTime) {
        requestAnimationFrame(detect);
        return;
      }
      lastVideoTime = video.currentTime;

      try {
        const results = poseLandmarkerRef.current.detectForVideo(video, performance.now());

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // 새로운 측정 시나리오 구현
          if (phase === MeasurementPhase.HEIGHT_CALIBRATION && !isHeightCalibrated) {
            // 키 기반 캘리브레이션
            const calibrated = calibrateWithHeight(landmarks);
            if (!calibrated) {
              // TODO: 전신 인식 기준 완화 - 더 관대한 피드백 메시지
              setFeedback('자세를 조정해주세요 (어깨와 발이 보이면 됩니다)');
            } else {
              // 캘리브레이션 완료 후 서서 측정 단계로 이동
              setTimeout(() => {
                setPhase(MeasurementPhase.STANDING_MEASUREMENT);
                setFeedback('서서 팔을 앞으로 뻗어주세요');
              }, 2000);
            }
          } else if (phase === MeasurementPhase.STANDING_MEASUREMENT) {
            // 서서 전신 측정 (3초간)
            if (!holdStartTime) {
              setHoldStartTime(Date.now());
              setFeedback('서서 팔을 앞으로 뻗은 자세를 유지하세요...');
            } else {
              const elapsed = (Date.now() - holdStartTime) / 1000;
              if (elapsed >= 3) {
                setPhase(MeasurementPhase.VOICE_GUIDANCE);
                setHoldStartTime(null);
                setVoiceGuidanceTimer(5); // 5초 음성 안내
                playVoiceGuidance('이제 바닥에 앉아서 다리를 쭉 펴고 앞으로 몸을 숙여주세요');
                setFeedback('음성 안내를 듣고 바닥에 앉아주세요');
              } else {
                setFeedback(`서서 자세 유지 중... ${(3 - elapsed).toFixed(1)}초 남음`);
              }
            }
          } else if (phase === MeasurementPhase.VOICE_GUIDANCE) {
            // 음성 안내 중 앉기 감지
            const isSitting = detectSittingPosture(landmarks);
            if (isSitting && !isUserSitting) {
              setIsUserSitting(true);
              setPhase(MeasurementPhase.SITTING_MEASUREMENT);
              setFeedback('좋습니다! 이제 앞으로 몸을 숙여주세요');
              playVoiceGuidance('다리를 쭉 펴고 앞으로 최대한 몸을 숙여주세요');
            }
          }

          // Calculate measurement
          const currentMeasurement = calculateWallDistance(landmarks);
          if (currentMeasurement) {
            setMeasurement(currentMeasurement);

            // 앉아서 측정하는 단계
            if (phase === MeasurementPhase.SITTING_MEASUREMENT) {
              if (currentMeasurement.isValidPosture) {
                if (!holdStartTime) {
                  setHoldStartTime(Date.now());
                  setFeedback('좋습니다! 자세를 유지하세요...');
                } else {
                  const elapsed = (Date.now() - holdStartTime) / 1000;
                  setCurrentHoldTime(elapsed);
                  
                  if (elapsed >= 3) {
                    setPhase(MeasurementPhase.RESULT);
                    setHoldStartTime(null);
                    
                    // 시도 횟수 증가
                    const newAttemptCount = attemptCount + 1;
                    setAttemptCount(newAttemptCount);
                    
                    // 최고 기록 업데이트
                    const currentDistance = currentMeasurement.distanceInCm;
                    if (currentDistance > bestMeasurement) {
                      setBestMeasurement(currentDistance);
                      localStorage.setItem('measurement_flexibility', currentDistance.toString());
                      setFeedback(`새 기록! ${currentDistance.toFixed(1)}cm (${newAttemptCount}/2회)`);
                    } else {
                      setFeedback(`측정 완료! ${currentDistance.toFixed(1)}cm (최고: ${bestMeasurement.toFixed(1)}cm) (${newAttemptCount}/2회)`);
                    }
                    
                    // 2회 측정 완료 시
                    if (newAttemptCount >= 2) {
                      addMeasurementCompletion('flexibility');
                      playVoiceGuidance('모든 측정이 완료되었습니다');
                    } else {
                      playVoiceGuidance('측정이 완료되었습니다. 한 번 더 측정하세요');
                    }
                  } else {
                    setFeedback(`자세 유지 중... ${(3 - elapsed).toFixed(1)}초 남음`);
                  }
                }
              } else {
                setHoldStartTime(null);
                setCurrentHoldTime(0);
                setFeedback('다리를 쭉 펴고 앞으로 몸을 숙여주세요');
              }
            }
          }
        } else {
          setFeedback('몸 전체가 화면에 보이도록 해주세요');
        }

        if (isRunning) {
          requestAnimationFrame(detect);
        }
      } catch (err) {
        console.error('Error in detect loop:', err);
        setError(`Detection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    detect();

    return () => {
      isRunning = false;
    };
  };


  const startMeasurement = () => {
    setPhase(MeasurementPhase.HEIGHT_CALIBRATION);
    setHoldStartTime(null);
    setCurrentHoldTime(0);
    setIsHeightCalibrated(false);
    setIsUserSitting(false);
    // TODO: 전신 인식 기준 완화 - 더 관대한 피드백 메시지
    setFeedback('화면에 보이도록 서주세요 (어깨와 발이 보이면 됩니다)');
    
    // 자동 캘리브레이션 적용 (3초 후)
    setTimeout(() => {
      setPixelToRealRatio(0.5); // 기본 비율값
      setIsHeightCalibrated(true);
      setPhase(MeasurementPhase.SITTING_MEASUREMENT);
      setFeedback('앉아서 앞으로 굽히기를 시작하세요');
    }, 3000);
  };

  const resetMeasurement = () => {
    setPhase(MeasurementPhase.SETUP);
    setMeasurement(null);
    setHoldStartTime(null);
    setCurrentHoldTime(0);
    setIsHeightCalibrated(false);
    setIsUserSitting(false);
    
    if (attemptCount >= 2) {
      // 2회 측정 완료 후 리셋하면 처음부터 다시
      setAttemptCount(0);
      setBestMeasurement(0);
      setFeedback('측정 시작 버튼을 눌러주세요');
    } else {
      // 아직 2회 측정이 안 끝났으면 다음 측정 준비
      setFeedback(`${attemptCount + 1}번째 측정을 시작하세요`);
    }
  };

  const forceCompleteMeasurement = () => {
    // 현재 측정값이 있으면 강제로 완료 처리
    if (measurement) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      const currentDistance = measurement.distanceInCm;
      if (currentDistance > bestMeasurement) {
        setBestMeasurement(currentDistance);
        localStorage.setItem('measurement_flexibility', currentDistance.toString());
        setFeedback(`강제 완료! 새 기록: ${currentDistance.toFixed(1)}cm (${newAttemptCount}/2회)`);
      } else {
        setFeedback(`강제 완료! ${currentDistance.toFixed(1)}cm (최고: ${bestMeasurement.toFixed(1)}cm) (${newAttemptCount}/2회)`);
      }
      
      setPhase(MeasurementPhase.RESULT);
      setHoldStartTime(null);
      
      if (newAttemptCount >= 2) {
        addMeasurementCompletion('flexibility');
      }
    } else {
      // 측정값이 없으면 기본값으로 처리
      const defaultDistance = 10; // 기본 10cm
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      if (defaultDistance > bestMeasurement) {
        setBestMeasurement(defaultDistance);
        localStorage.setItem('measurement_flexibility', defaultDistance.toString());
      }
      
      setFeedback(`강제 완료! 기본값: ${defaultDistance}cm (${newAttemptCount}/2회)`);
      setPhase(MeasurementPhase.RESULT);
      setHoldStartTime(null);
      
      if (newAttemptCount >= 2) {
        addMeasurementCompletion('flexibility');
      }
    }
  };

  const handleSaveResult = () => {
    if (measurement) {
      // TODO: 임시로 최소 17cm 보장 - 실제 측정값이 17cm 미만이면 17cm로 설정
      const finalDistance = Math.max(measurement.distanceInCm, 17);
      
      // 측정 결과를 localStorage에 저장
      const storageKey = `measurement_sit_and_reach`;
      localStorage.setItem(storageKey, finalDistance.toString());
      
      // 측정 완료 상태 저장
      addMeasurementCompletion('flexibility');
      
      // measurement 페이지로 이동
      window.location.href = '/measurement';
    }
  };

  // 키 기반 자동 캘리브레이션
  const calibrateWithHeight = (landmarks: any[]) => {
    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHeel = landmarks[POSE_LANDMARKS.LEFT_HEEL];
    const rightHeel = landmarks[POSE_LANDMARKS.RIGHT_HEEL];
    
    // 대안: 발목 사용
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    // 디버깅: 랜드마크 감지 상태 확인
    console.log('Calibration Debug:', {
      nose: nose ? 'detected' : 'missing',
      leftShoulder: leftShoulder ? 'detected' : 'missing',
      rightShoulder: rightShoulder ? 'detected' : 'missing',
      leftHeel: leftHeel ? 'detected' : 'missing',
      rightHeel: rightHeel ? 'detected' : 'missing',
      leftAnkle: leftAnkle ? 'detected' : 'missing',
      rightAnkle: rightAnkle ? 'detected' : 'missing'
    });

    // 어깨 중점 계산
    let shoulderMidpoint;
    if (leftShoulder && rightShoulder) {
      shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
    } else if (leftShoulder || rightShoulder) {
      shoulderMidpoint = leftShoulder || rightShoulder;
    }

    // 발뒤꿈치 우선, 없으면 발목 사용
    const footLeft = leftHeel || leftAnkle;
    const footRight = rightHeel || rightAnkle;

    if (!shoulderMidpoint || (!footLeft && !footRight)) {
      // TODO: 전신 인식 기준 완화 - 더 관대한 피드백 메시지
      setFeedback('화면에 보이도록 서주세요 (어깨와 발 중 일부만 보여도 됩니다)');
      return false;
    }

    // 발 중점 (발뒤꿈치 또는 발목)
    let footMidpoint;
    if (footLeft && footRight) {
      footMidpoint = {
        x: (footLeft.x + footRight.x) / 2,
        y: (footLeft.y + footRight.y) / 2
      };
    } else {
      footMidpoint = footLeft || footRight;
    }

    // 어깨에서 발까지의 거리 측정 (더 정확함)
    const videoHeight = videoRef.current?.videoHeight || 640;
    const shoulderToFootPixels = Math.abs(shoulderMidpoint.y - footMidpoint.y) * videoHeight;
    
    // 인체공학적 비율: 어깨 높이는 전체 키의 약 81%
    // 따라서 어깨→발 거리 = 전체 키의 81%
    // 실제 키 = (어깨-발 거리) / 0.81
    const estimatedBodyHeightFromShoulder = shoulderToFootPixels / 0.81;
    
    // 최종 사용할 픽셀 거리
    const bodyHeightInPixels = estimatedBodyHeightFromShoulder;
    
    console.log('Height calculation:', {
      shoulderY: shoulderMidpoint.y,
      footMidpointY: footMidpoint.y,
      shoulderToFootPixels: shoulderToFootPixels,
      estimatedBodyHeightFromShoulder: estimatedBodyHeightFromShoulder,
      bodyHeightInPixels: bodyHeightInPixels,
      userHeight: userHeight,
      videoHeight: videoHeight,
      threshold: 50
    });
    
    if (bodyHeightInPixels > 50) { // 최소 50픽셀 이상일 때만 캘리브레이션 (임계값 더 낮춤)
      // 실제 키와 픽셀 거리의 비율 계산
      const newPixelToRealRatio = userHeight / bodyHeightInPixels;
      setPixelToRealRatio(newPixelToRealRatio);
      setIsHeightCalibrated(true);
      setFeedback(`키 기반 캘리브레이션 완료! (${bodyHeightInPixels.toFixed(0)}픽셀 = ${userHeight}cm)`);
      return true;
    } else {
      // TODO: 전신 인식 기준 완화 - 더 관대한 피드백 메시지
      setFeedback(`조금 더 가깝게 서주세요 (현재: ${bodyHeightInPixels.toFixed(0)}픽셀)`);
    }
    
    return false;
  };

  // 사용자가 앉았는지 감지하는 함수
  const detectSittingPosture = (landmarks: any[]) => {
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const leftHeel = landmarks[POSE_LANDMARKS.LEFT_HEEL];
    const rightHeel = landmarks[POSE_LANDMARKS.RIGHT_HEEL];

    if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftHeel || !rightHeel) {
      return false;
    }

    // 엉덩이와 무릎의 높이 차이로 앉기 판단
    const hipMidpoint = (leftHip.y + rightHip.y) / 2;
    const kneeMidpoint = (leftKnee.y + rightKnee.y) / 2;
    const heelMidpoint = (leftHeel.y + rightHeel.y) / 2;

    // 앉은 자세: 엉덩이가 무릎보다 아래에 있고, 무릎이 발뒤꿈치보다 위에 있음
    const isSitting = hipMidpoint > kneeMidpoint && kneeMidpoint < heelMidpoint;
    
    return isSitting;
  };

  // 음성 안내 함수
  const playVoiceGuidance = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // 음성 안내 타이머 useEffect
  useEffect(() => {
    if (voiceGuidanceTimer > 0) {
      const timer = setTimeout(() => {
        setVoiceGuidanceTimer(voiceGuidanceTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [voiceGuidanceTimer]);

  useEffect(() => {
    // 페이지 로드 시 자동으로 카메라 권한 요청 및 시작
    const initializeOnMount = async () => {
      if (typeof window !== 'undefined') {
        try {
          // MediaPipe 초기화
          await initializePoseLandmarker();
          
          // 카메라 권한 자동 요청
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, 
            audio: false 
          });
          
          // 권한이 허용되면 카메라 시작
          setCameraPermissionGranted(true);
          setIsActive(true);
          
          // 스트림을 비디오 엘리먼트에 연결
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await new Promise<void>((resolve) => {
              if (videoRef.current) {
                videoRef.current.onloadedmetadata = () => resolve();
              }
            });
            await videoRef.current.play();
          }
          
          // Pose detection 시작
          const cleanup = detectPose();
          cleanupDetectionRef.current = cleanup || null;
          
          // 측정 시작
          startMeasurement();
          setFeedback('카메라가 시작되었습니다. 측정 시작 버튼을 눌러주세요.');
          
        } catch (error) {
          console.error('카메라 권한 요청 실패:', error);
          // 권한이 거부되면 모달 표시
          setShowCameraPermission(true);
        }
      }
    };
    
    initializeOnMount();
    
    return () => {
      stopCamera();
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col pb-20">
      {/* 카메라 권한 요청 모달 */}
      <CameraPermissionModal
        isOpen={showCameraPermission}
        onPermissionGranted={handleCameraPermissionGranted}
        onPermissionDenied={handleCameraPermissionDenied}
        exerciseTitle="유연성 측정"
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
          exerciseName="앉아윗몸앞으로굽히기"
          videoRef={videoRef}
          isPortrait={true}
          timerStatus={
            phase === MeasurementPhase.SITTING_MEASUREMENT ? 'measuring' : 
            phase === MeasurementPhase.RESULT ? (attemptCount >= 2 ? 'finished' : 'idle') : 
            'idle'
          }
          preparingTime={preparingTime}
          remainingTime={remainingTime}
          count={measurement ? Math.round(measurement.distanceInCm) : 0}
          isFullBodyDetected={true}
          feedback={feedback}
          state={phase}
          showCount={false}
          showTimer={false}
          instructions={
             <div className="bg-[#F5F5F5] p-4 rounded-[20px] flex flex-col gap-2">
                                   <p className={`${FONT_STYLES.body9} text-[#767676]`}>사용방법</p>
                                   <div className={`${FONT_STYLES.body10} text-[#767676] flex flex-col gap-1`}>{EXERCISE_GUIDES[`sit-and-reach`]?.instructions.map((instruction, index) => <p key={index}>{instruction}</p>)}</div>
                                  </div>
          }
          additionalInfo={
            <>
              {/* 측정 진행 상황 */}
              {(attemptCount > 0 || bestMeasurement > 0) && (
                <div className="bg-blue-50 p-4 rounded-[20px] mb-4">
                  <div className={`${FONT_STYLES.body9} text-[#767676] mb-2`}>측정 결과</div>
                  <div className="flex justify-between items-center">
                    <span className={`${FONT_STYLES.body10} text-[#767676]`}>시도 횟수:</span>
                    <span className={`${FONT_STYLES.body10} font-bold text-[#9B8EC2]`}>{attemptCount}/2회</span>
                  </div>
                  {bestMeasurement > 0 && (
                    <div className="flex justify-between items-center mt-1">
                      <span className={`${FONT_STYLES.body10} text-[#767676]`}>최고 기록:</span>
                      <span className={`${FONT_STYLES.body10} font-bold text-[#9B8EC2]`}>{bestMeasurement.toFixed(1)}cm</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Height Calibration Status */}
              {phase === MeasurementPhase.HEIGHT_CALIBRATION && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <div className="font-semibold text-white mb-2">� 키 기반 캘리브레이션</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">설정된 키:</span>
                      <span className="text-blue-400 font-bold">{userHeight}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">캘리브레이션 상태:</span>
                      <span className={`font-bold ${isHeightCalibrated ? 'text-green-400' : 'text-yellow-400'}`}>
                        {isHeightCalibrated ? '완료' : '진행 중...'}
                      </span>
                    </div>
                    
                    {/* 수동 캘리브레이션 버튼 */}
                    {!isHeightCalibrated && (
                      <button
                        onClick={() => {
                          // 강제로 캘리브레이션 완료 처리
                          setPixelToRealRatio(0.5); // 임시 비율값
                          setIsHeightCalibrated(true);
                          setFeedback('수동 캘리브레이션 완료! 측정을 시작합니다.');
                        }}
                        className="w-full mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition"
                      >
                        🔧 수동으로 캘리브레이션
                      </button>
                    )}
                    {isHeightCalibrated && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">스케일:</span>
                        <span className="text-green-400 font-bold">{pixelToRealRatio.toFixed(4)} cm/픽셀</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          }
          onStartCamera={!isActive ? startCamera : undefined}
          onStartMeasurement={() => {
            if (phase === MeasurementPhase.SETUP || phase === MeasurementPhase.RESULT) {
              startMeasurement();
            } else if (phase === MeasurementPhase.HEIGHT_CALIBRATION || phase === MeasurementPhase.SITTING_MEASUREMENT) {
              // 측정 중일 때 클릭하면 강제로 측정 완료 처리
              forceCompleteMeasurement();
            }
          }}
          onStopMeasurement={resetMeasurement}
          onSaveResult={handleSaveResult}
          onVideoClick={() => {}}
        />
      )}
    </div>
  );
}
