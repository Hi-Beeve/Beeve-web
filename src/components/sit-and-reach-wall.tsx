'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { MeasurementUI } from './measurement-ui';

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
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12
};

export function SitAndReachWall() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<MeasurementPhase>(MeasurementPhase.SETUP);
  const [measurement, setMeasurement] = useState<WallMeasurement | null>(null);
  const [pixelToRealRatio, setPixelToRealRatio] = useState<number>(0.1); // 기본값: 1픽셀 = 0.1cm
  const [wallPosition, setWallPosition] = useState<number>(100); // 화면에서 벽의 x 좌표
  const [userHeight, setUserHeight] = useState<number>(170); // 사용자 키 (cm) - 기본값 또는 프로필에서 가져옴
  const [isHeightCalibrated, setIsHeightCalibrated] = useState<boolean>(false);
  const [voiceGuidanceTimer, setVoiceGuidanceTimer] = useState<number>(0);
  const [isUserSitting, setIsUserSitting] = useState<boolean>(false);
  
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

  const startCamera = async () => {
    try {
      if (typeof window === 'undefined') return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera not supported in this browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: 480, 
          height: 640, // 3:4 세로 비율
          aspectRatio: 3/4 
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
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
  };

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
              setFeedback('전신이 화면에 보이도록 자세를 조정해주세요');
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
                    setFeedback('측정 완료!');
                    playVoiceGuidance('측정이 완료되었습니다');
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

  const toggleCamera = async () => {
    if (!isActive) {
      setIsActive(true);
      
      if (!poseLandmarkerRef.current) {
        const initialized = await initializePoseLandmarker();
        if (!initialized) {
          setIsActive(false);
          return;
        }
      }
      
      await startCamera();
    } else {
      setIsActive(false);
      stopCamera();
    }
  };

  const startMeasurement = () => {
    setPhase(MeasurementPhase.HEIGHT_CALIBRATION);
    setHoldStartTime(null);
    setCurrentHoldTime(0);
    setIsHeightCalibrated(false);
    setIsUserSitting(false);
    setFeedback('전신이 화면에 보이도록 서주세요');
  };

  const resetMeasurement = () => {
    setPhase(MeasurementPhase.SETUP);
    setMeasurement(null);
    setHoldStartTime(null);
    setCurrentHoldTime(0);
    setIsHeightCalibrated(false);
    setIsUserSitting(false);
  };

  // 키 기반 자동 캘리브레이션
  const calibrateWithHeight = (landmarks: any[]) => {
    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const leftHeel = landmarks[POSE_LANDMARKS.LEFT_HEEL];
    const rightHeel = landmarks[POSE_LANDMARKS.RIGHT_HEEL];

    if (!nose || !leftHeel || !rightHeel) return false;

    // 발뒤꿈치 중점
    const heelMidpoint = {
      x: (leftHeel.x + rightHeel.x) / 2,
      y: (leftHeel.y + rightHeel.y) / 2
    };

    // 코에서 발뒤꿈치까지의 픽셀 거리 (전신 높이)
    const bodyHeightInPixels = Math.abs(nose.y - heelMidpoint.y) * 640; // 3:4 세로 해상도 기준
    
    if (bodyHeightInPixels > 200) { // 최소 200픽셀 이상일 때만 캘리브레이션
      // 실제 키와 픽셀 거리의 비율 계산
      const newPixelToRealRatio = userHeight / bodyHeightInPixels;
      setPixelToRealRatio(newPixelToRealRatio);
      setIsHeightCalibrated(true);
      setFeedback(`키 기반 캘리브레이션 완료! (${bodyHeightInPixels.toFixed(0)}픽셀 = ${userHeight}cm)`);
      return true;
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
    // 페이지 로드 시 자동으로 카메라 시작 및 측정 시작
    const initializeOnMount = async () => {
      if (typeof window !== 'undefined') {
        await initializePoseLandmarker();
        // 자동으로 카메라 시작
        setIsActive(true);
        await startCamera();
        // 자동으로 측정 시작
        startMeasurement();
      }
    };
    
    initializeOnMount();
    
    return () => {
      stopCamera();
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-xl">MediaPipe 로딩 중...</div>
        </div>
      ) : (
        <MeasurementUI
          videoRef={videoRef}
          timerStatus={phase === MeasurementPhase.SITTING_MEASUREMENT ? 'measuring' : 'idle'}
          preparingTime={preparingTime}
          remainingTime={remainingTime}
          count={measurement ? Math.round(measurement.distanceInCm) : 0}
          isFullBodyDetected={true}
          feedback={feedback}
          state={phase}
          additionalInfo={
            <>
              {/* Phase indicator */}
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="font-semibold text-white mb-2">📊 측정 단계</div>
                <div className="flex gap-2 text-sm flex-wrap">
                  {Object.values(MeasurementPhase).map((p) => (
                    <span
                      key={p}
                      className={`px-2 py-1 rounded ${
                        phase === p ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Height Input */}
              {phase === MeasurementPhase.SETUP && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <div className="font-semibold text-white mb-2">� 키 설정</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        본인의 키를 입력하세요 (cm):
                      </label>
                      <input
                        type="number"
                        min="140"
                        max="220"
                        step="0.1"
                        value={userHeight}
                        onChange={(e) => setUserHeight(Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-gray-700 text-white rounded text-center text-lg"
                      />
                      <span className="ml-2 text-gray-400">cm</span>
                    </div>
                    
                    <div className="bg-blue-900 p-3 rounded text-xs">
                      <div className="text-blue-200 font-bold mb-1">� 측정 방법:</div>
                      <div className="text-blue-300">
                        • 세로로 긴 화면 비율 (16:9)<br/>
                        • 전신 측정 → 음성 안내 → 앉아서 측정<br/>
                        • 키 기반 자동 스케일링
                      </div>
                    </div>

                    <div className="bg-gray-700 p-3 rounded text-xs">
                      <div className="text-gray-300 mb-1">참고 사이즈:</div>
                      <div className="grid grid-cols-2 gap-2 text-gray-400">
                        <div>• 230mm → 23cm</div>
                        <div>• 240mm → 24cm</div>
                        <div>• 250mm → 25cm</div>
                        <div>• 260mm → 26cm</div>
                      </div>
                    </div>

                  </div>
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
                    {isHeightCalibrated && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">스케일:</span>
                        <span className="text-green-400 font-bold">{pixelToRealRatio.toFixed(4)} cm/픽셀</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Measurement data */}
              {measurement && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <div className="font-semibold text-white mb-2">📏 측정 데이터</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">거리:</span>
                      <span className="text-green-400 font-bold">{measurement.distanceInCm.toFixed(1)}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">유지 시간:</span>
                      <span className="text-yellow-400 font-bold">{currentHoldTime.toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">올바른 자세:</span>
                      <span className={`font-bold ${measurement.isValidPosture ? 'text-green-400' : 'text-red-400'}`}>
                        {measurement.isValidPosture ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {measurement && phase === MeasurementPhase.RESULT && (
                <div className="bg-green-800 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-green-200 mb-2">🎉 측정 완료!</h3>
                  <div className="space-y-1 text-green-100">
                    <p>벽에서 발뒤꿈치까지의 거리: <strong className="text-white">{measurement.distanceInCm.toFixed(1)}cm</strong></p>
                    <p>유지 시간: <strong className="text-white">{measurement.holdDuration.toFixed(1)}초</strong></p>
                  </div>
                </div>
              )}
            </>
          }
          instructions={
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold text-white mb-2">💡 사용 방법:</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <li><strong className="text-white">벽을 향해</strong> 앉아서 다리를 펴세요</li>
                <li><strong className="text-white">손끝이 벽에 닿도록</strong> 몸을 기울이세요</li>
                <li><strong className="text-white">3초간</strong> 자세를 유지하세요</li>
                <li>무릎이 구부러지지 않도록 주의하세요</li>
                <li>양손이 함께 움직이도록 하세요</li>
              </ul>
            </div>
          }
          onStartCamera={startCamera}
          onStartMeasurement={() => {
            if (phase === MeasurementPhase.SETUP) {
              startMeasurement();
            }
          }}
          onStopMeasurement={resetMeasurement}
          onReset={resetMeasurement}
          onVideoClick={() => {}}
          countLabel="거리 (cm)"
          timeLabel="유지 시간"
        />
      )}
    </div>
  );
}
