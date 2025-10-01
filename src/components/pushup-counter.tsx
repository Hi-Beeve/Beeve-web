'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

// 각도 계산 함수 (3점 사이의 각도)
// a-b-c에서 b가 꼭지점
const calculateAngle = (a: any, b: any, c: any): number => {
  // 벡터 ba와 bc 계산
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  
  // 내적과 벡터 크기로 각도 계산
  const dotProduct = ba.x * bc.x + ba.y * bc.y;
  const magnitudeBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  
  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
  
  return angle;
};

type PushupState = 'ready' | 'down' | 'up';

export function PushupCounter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [state, setState] = useState<PushupState>('ready');
  const [feedback, setFeedback] = useState('');
  const [leftElbowAngle, setLeftElbowAngle] = useState(0);
  const [rightElbowAngle, setRightElbowAngle] = useState(0);
  const [bodyAngle, setBodyAngle] = useState(0);

  const stateRef = useRef<PushupState>('ready');
  const downFrameCountRef = useRef(0);
  const upFrameCountRef = useRef(0);
  const downAngleRef = useRef(0); // DOWN 상태일 때의 최소 각도 기록

  // 임계값 (실제 측정된 각도 기준으로 조정)
  const ELBOW_DOWN_THRESHOLD = 115; // 팔을 구부린 상태 (115도 이하) - 로그 기준 88~112도
  const ELBOW_UP_THRESHOLD = 155; // 팔을 편 상태 (155도 이상) - 로그 기준 162~164도
  const BODY_ALIGNMENT_MIN = 120; // 몸통 체크 완화 (120도 이상) - 로그 기준 121~156도
  const FRAME_THRESHOLD = 3; // 3프레임으로 반응성 향상
  const ANGLE_CHANGE_MIN = 45; // DOWN->UP 사이 최소 각도 변화량 (88도→162도 = 74도)

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

  // 카메라 시작
  const startCamera = async () => {
    if (typeof window === 'undefined') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          detectPose();
        };
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      setFeedback('카메라 권한이 필요합니다');
    }
  };

  // 푸시업 인식 및 카운팅
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
            if ([11, 13, 15, 23].includes(data.index)) return 6;
            return 2;
          },
        });
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS
        );

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

        // 푸시업 로직 (개선된 정확도)
        
        // DOWN 감지: 팔꿈치가 100도 이하 (팔을 구부림)
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
        // UP 감지: DOWN 상태에서 팔꿈치가 150도 이상 + 충분한 각도 변화
        else if (avgElbowAngle > ELBOW_UP_THRESHOLD && stateRef.current === 'down') {
          const angleChange = avgElbowAngle - downAngleRef.current;
          upFrameCountRef.current++;
          downFrameCountRef.current = 0;
          
          // 충분한 각도 변화가 있어야 UP 인정
          if (upFrameCountRef.current >= FRAME_THRESHOLD && angleChange >= ANGLE_CHANGE_MIN) {
            newState = 'up';
            setCount(prev => prev + 1);
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
        // 중간 각도 (100도 ~ 150도)
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

        if (newState !== stateRef.current) {
          stateRef.current = newState;
          setState(newState);
        }
        setFeedback(newFeedback);

        // 각도 표시 (더 상세하게)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        
        const angleText = `팔꿈치: L ${currentLeftElbowAngle.toFixed(0)}° | R ${currentRightElbowAngle.toFixed(0)}° | Avg ${avgElbowAngle.toFixed(0)}°`;
        ctx.strokeText(angleText, 10, 30);
        ctx.fillText(angleText, 10, 30);

        const bodyText = `몸통: ${currentBodyAngle.toFixed(0)}° | 상태: ${stateRef.current.toUpperCase()}`;
        ctx.strokeText(bodyText, 10, 60);
        ctx.fillText(bodyText, 10, 60);

        // 프레임 카운터 표시
        const frameText = `DOWN: ${downFrameCountRef.current}/${FRAME_THRESHOLD} | UP: ${upFrameCountRef.current}/${FRAME_THRESHOLD}`;
        ctx.strokeText(frameText, 10, 90);
        ctx.fillText(frameText, 10, 90);

        // 상태 표시 (색상으로 구분)
        const stateColor = isBodyStraight ? '#00FF00' : '#FF6600';
        ctx.fillStyle = stateColor;
        ctx.strokeStyle = '#000000';
        const stateText = `자세: ${isBodyStraight ? '좋음 ✓' : '교정 필요'} (${BODY_ALIGNMENT_MIN}° 필요)`;
        ctx.strokeText(stateText, 10, 120);
        ctx.fillText(stateText, 10, 120);

        // 임계값 가이드 (색상으로 현재 상태 표시)
        ctx.fillStyle = avgElbowAngle < ELBOW_DOWN_THRESHOLD ? '#FF0000' : avgElbowAngle > ELBOW_UP_THRESHOLD ? '#00FF00' : '#FFFF00';
        const thresholdText = `목표: 구부림 < ${ELBOW_DOWN_THRESHOLD}° | 펴기 > ${ELBOW_UP_THRESHOLD}°`;
        ctx.strokeText(thresholdText, 10, 150);
        ctx.fillText(thresholdText, 10, 150);

      } else {
        setFeedback('몸 전체가 화면에 보이도록 해주세요 (옆모습)');
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  const resetCounter = () => {
    setCount(0);
    setState('ready');
    stateRef.current = 'ready';
    setFeedback('');
    downFrameCountRef.current = 0;
    upFrameCountRef.current = 0;
    downAngleRef.current = 0;
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Push Up Counter 🏋️</h1>
      
      {isLoading ? (
        <div className="text-xl">MediaPipe 로딩 중...</div>
      ) : (
        <>
          <div className="relative mb-4 border-4 border-blue-500 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="block"
              style={{ transform: 'scaleX(-1)' }}
              width={640}
              height={480}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 w-full max-w-2xl">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-5xl font-bold text-blue-400">{count}</div>
              <div className="text-lg text-gray-300 mt-2">푸시업 횟수</div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">왼쪽 팔꿈치</div>
              <div className="text-2xl font-bold text-green-400">{leftElbowAngle.toFixed(0)}°</div>
              <div className="text-sm text-gray-400 mt-2">오른쪽 팔꿈치</div>
              <div className="text-2xl font-bold text-green-400">{rightElbowAngle.toFixed(0)}°</div>
              <div className="text-sm text-gray-400 mt-2">몸통 각도</div>
              <div className="text-2xl font-bold text-yellow-400">{bodyAngle.toFixed(0)}°</div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center w-full max-w-2xl mb-4">
            <div className="text-xl font-semibold text-yellow-300">{feedback}</div>
            <div className="text-sm text-gray-400 mt-2">
              상태: <span className="text-blue-300 font-semibold">{state.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex gap-4">
            {!videoRef.current?.srcObject ? (
              <button
                onClick={startCamera}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-lg"
              >
                📹 카메라 시작
              </button>
            ) : (
              <button
                onClick={resetCounter}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition text-lg"
              >
                🔄 리셋
              </button>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-400 max-w-2xl bg-gray-800 p-4 rounded-lg">
            <div className="font-semibold text-white mb-2">💡 사용 방법:</div>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>옆모습</strong>이 보이도록 카메라를 설치하세요</li>
              <li>팔꿈치 각도가 <strong>90도 이하</strong>로 내려가면 DOWN</li>
              <li>팔꿈치 각도가 <strong>160도 이상</strong>으로 올라가면 카운트!</li>
              <li>몸통은 <strong>일직선</strong>을 유지해야 정확하게 측정됩니다</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
