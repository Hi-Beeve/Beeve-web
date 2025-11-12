'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

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
  CALIBRATION = 'calibration',
  POSITIONING = 'positioning',
  MEASURING = 'measuring',
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
  RIGHT_HIP: 24
};

export function SitAndReachWall() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<MeasurementPhase>(MeasurementPhase.SETUP);
  const [measurement, setMeasurement] = useState<WallMeasurement | null>(null);
  const [pixelToRealRatio, setPixelToRealRatio] = useState<number>(0.1); // 기본값: 1픽셀 = 0.1cm
  const [wallPosition, setWallPosition] = useState<number>(100); // 화면에서 벽의 x 좌표
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null);
  const [currentHoldTime, setCurrentHoldTime] = useState<number>(0);
  
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
        video: { width: 640, height: 480 },
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
        const cleanup = detectPose();
        cleanupDetectionRef.current = cleanup || null;
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
    if (!videoRef.current || !canvasRef.current || !poseLandmarkerRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const canvasCtx = canvas.getContext('2d');

    if (!canvasCtx) return;

    let isRunning = true;

    const detect = () => {
      if (!isRunning || !video || !poseLandmarkerRef.current) return;

      const startTimeMs = performance.now();
      
      try {
        const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

        // Clear canvas
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw wall line
        canvasCtx.strokeStyle = '#ff0000';
        canvasCtx.lineWidth = 3;
        canvasCtx.beginPath();
        canvasCtx.moveTo(wallPosition, 0);
        canvasCtx.lineTo(wallPosition, canvas.height);
        canvasCtx.stroke();

        // Draw pose landmarks
        if (results.landmarks && results.landmarks.length > 0) {
          const drawingUtils = new DrawingUtils(canvasCtx);
          
          for (const landmarks of results.landmarks) {
            drawingUtils.drawLandmarks(landmarks, {
              radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);

            // Calculate measurement
            const currentMeasurement = calculateWallDistance(landmarks);
            if (currentMeasurement) {
              setMeasurement(currentMeasurement);

              // Handle measurement phases
              if (phase === MeasurementPhase.MEASURING) {
                if (currentMeasurement.isValidPosture) {
                  if (!holdStartTime) {
                    setHoldStartTime(Date.now());
                  } else {
                    const elapsed = (Date.now() - holdStartTime) / 1000;
                    setCurrentHoldTime(elapsed);
                    
                    if (elapsed >= 3) {
                      setPhase(MeasurementPhase.RESULT);
                      setHoldStartTime(null);
                    }
                  }
                } else {
                  setHoldStartTime(null);
                  setCurrentHoldTime(0);
                }
              }

              // Draw measurement info
              canvasCtx.fillStyle = '#00ff00';
              canvasCtx.font = '16px Arial';
              canvasCtx.fillText(`Distance: ${currentMeasurement.distanceInCm.toFixed(1)}cm`, 10, 30);
              canvasCtx.fillText(`Hold Time: ${currentHoldTime.toFixed(1)}s`, 10, 50);
              canvasCtx.fillText(`Valid Posture: ${currentMeasurement.isValidPosture ? 'Yes' : 'No'}`, 10, 70);
            }
          }
        }

        canvasCtx.restore();

        if (isRunning) {
          animationFrameRef.current = requestAnimationFrame(detect);
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
    setPhase(MeasurementPhase.MEASURING);
    setHoldStartTime(null);
    setCurrentHoldTime(0);
  };

  const resetMeasurement = () => {
    setPhase(MeasurementPhase.POSITIONING);
    setMeasurement(null);
    setHoldStartTime(null);
    setCurrentHoldTime(0);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">벽 기준 윗몸앞으로굽히기</h2>
      <p className="text-sm text-muted-foreground">벽에 손끝을 대고 발뒤꿈치까지의 거리를 측정합니다</p>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg w-full">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Phase indicator */}
      <div className="flex gap-2 text-sm">
        {Object.values(MeasurementPhase).map((p) => (
          <span
            key={p}
            className={`px-2 py-1 rounded ${
              phase === p ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Calibration controls */}
      {phase === MeasurementPhase.CALIBRATION && (
        <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded">
          <label className="text-sm font-medium">
            Wall Position (pixels):
            <input
              type="range"
              min="50"
              max="590"
              value={wallPosition}
              onChange={(e) => setWallPosition(Number(e.target.value))}
              className="ml-2"
            />
            {wallPosition}
          </label>
          <label className="text-sm font-medium">
            Scale (pixels per cm):
            <input
              type="number"
              step="0.01"
              value={1 / pixelToRealRatio}
              onChange={(e) => setPixelToRealRatio(1 / Number(e.target.value))}
              className="ml-2 w-20 px-2 py-1 border rounded"
            />
          </label>
          <button
            onClick={() => setPhase(MeasurementPhase.POSITIONING)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Calibration Complete
          </button>
        </div>
      )}

      <div className="relative flex flex-col gap-2">
        <video
          ref={videoRef}
          className="border rounded-lg"
          width={640}
          height={480}
          playsInline
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="border rounded-lg bg-black absolute top-0 left-0"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <p className="text-white">Loading MediaPipe...</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={toggleCamera}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Initializing...' : isActive ? 'Stop Camera' : 'Start Camera'}
        </button>

        {isActive && phase === MeasurementPhase.SETUP && (
          <button
            onClick={() => setPhase(MeasurementPhase.CALIBRATION)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Calibrate
          </button>
        )}

        {phase === MeasurementPhase.POSITIONING && (
          <button
            onClick={startMeasurement}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start Measurement
          </button>
        )}

        {phase === MeasurementPhase.RESULT && (
          <button
            onClick={resetMeasurement}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Measure Again
          </button>
        )}
      </div>

      {/* Results */}
      {measurement && phase === MeasurementPhase.RESULT && (
        <div className="p-4 bg-green-100 rounded-lg w-full">
          <h3 className="font-semibold text-green-800">측정 완료!</h3>
          <p className="text-green-700">
            벽에서 발뒤꿈치까지의 거리: <strong>{measurement.distanceInCm.toFixed(1)}cm</strong>
          </p>
          <p className="text-green-700">
            유지 시간: <strong>{measurement.holdDuration.toFixed(1)}초</strong>
          </p>
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        <p>1. 벽을 향해 앉아서 다리를 펴세요</p>
        <p>2. 손끝이 벽에 닿도록 몸을 기울이세요</p>
        <p>3. 3초간 자세를 유지하세요</p>
      </div>
    </div>
  );
}
