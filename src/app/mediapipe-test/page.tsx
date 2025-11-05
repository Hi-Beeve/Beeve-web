import Link from 'next/link';
import { MediaPipeVisionTest } from '@/components/mediapipe-vision-test';

export default function MediaPipeTestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">MediaPipe Test Page</h1>
          <p className="text-muted-foreground">
            Testing MediaPipe Pose Detection with Camera
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-blue-500 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <MediaPipeVisionTest />

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Using MediaPipe Tasks Vision API</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>@mediapipe/tasks-vision</strong> - Modern Tasks API with PoseLandmarker</li>
            <li>Real-time pose detection with 33 body landmarks</li>
            <li>GPU acceleration support</li>
            <li>Works seamlessly with Next.js</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Note: The legacy @mediapipe/pose and @mediapipe/camera_utils packages are not compatible 
            with Next.js ES modules. Use the Vision API instead.
          </p>
        </div>
      </div>
    </div>
  );
}
