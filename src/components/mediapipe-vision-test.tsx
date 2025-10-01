'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export function MediaPipeVisionTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cleanupDetectionRef = useRef<(() => void) | null>(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      // Check if running in browser
      if (typeof window === 'undefined') {
        console.log('Window is undefined - server side');
        return;
      }

      // Debug logging
      console.log('Navigator:', typeof navigator);
      console.log('Navigator.mediaDevices:', navigator.mediaDevices);
      console.log('getUserMedia:', navigator.mediaDevices?.getUserMedia);

      if (!navigator.mediaDevices) {
        setError(`Camera API not available. Protocol: ${window.location.protocol}, Host: ${window.location.host}`);
        return;
      }

      if (!navigator.mediaDevices.getUserMedia) {
        setError('getUserMedia not supported. Try updating your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      console.log('Stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded');
              resolve();
            };
          }
        });
        
        await videoRef.current.play();
        console.log('Video playing, starting detection');
        const cleanup = detectPose();
        cleanupDetectionRef.current = cleanup || null;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      const errorMessage = err instanceof Error ? err.name : 'Unknown error';
      if (errorMessage === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (errorMessage === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError(`Failed to access camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const stopCamera = () => {
    // Stop detection loop
    if (cleanupDetectionRef.current) {
      cleanupDetectionRef.current();
      cleanupDetectionRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const detectPose = () => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarkerRef.current) {
      console.log('detectPose: Missing refs', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        poseLandmarker: !!poseLandmarkerRef.current
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const canvasCtx = canvas.getContext('2d');

    if (!canvasCtx) {
      console.log('detectPose: No canvas context');
      return;
    }

    console.log('Starting pose detection loop');
    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

    // Test: Draw something on canvas immediately
    canvasCtx.fillStyle = 'red';
    canvasCtx.fillRect(0, 0, 100, 100);
    console.log('Test rectangle drawn on canvas');

    let isRunning = true; // Use local variable instead of state

    const detect = () => {
      if (!isRunning || !video || !poseLandmarkerRef.current) {
        console.log('Detect stopped:', { isRunning, hasVideo: !!video, hasPoseLandmarker: !!poseLandmarkerRef.current });
        return;
      }

      const startTimeMs = performance.now();
      
      try {
        const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

        // Clear canvas
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw pose landmarks
        if (results.landmarks && results.landmarks.length > 0) {
          const drawingUtils = new DrawingUtils(canvasCtx);
          
          for (const landmarks of results.landmarks) {
            drawingUtils.drawLandmarks(landmarks, {
              radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
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

    // Return cleanup function
    return () => {
      isRunning = false;
      console.log('Detection loop cleanup called');
    };
  };

  const toggleCamera = async () => {
    if (!isActive) {
      // Start
      setIsActive(true); // Set active BEFORE starting camera
      
      if (!poseLandmarkerRef.current) {
        const initialized = await initializePoseLandmarker();
        if (!initialized) {
          setIsActive(false);
          return;
        }
      }
      
      await startCamera();
    } else {
      // Stop
      setIsActive(false);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
        <h2 className="text-2xl font-bold">MediaPipe Vision API Test</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">MediaPipe Vision API Test</h2>
      <p className="text-sm text-muted-foreground">Using @mediapipe/tasks-vision (newer API)</p>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg w-full">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
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
          className="border rounded-lg bg-black"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <p className="text-white">Loading MediaPipe Vision...</p>
          </div>
        )}
      </div>

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

      <div className="text-sm text-muted-foreground text-center">
        <p>Click "Start Camera" to begin pose detection</p>
        <p className="mt-1">This uses the newer MediaPipe Tasks Vision API</p>
      </div>
    </div>
  );
}
