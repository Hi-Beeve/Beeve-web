# MediaPipe Setup Guide

## Installed Package

MediaPipe Tasks Vision API has been successfully installed:

```bash
npm install @mediapipe/tasks-vision
```

### Package Details

- **@mediapipe/tasks-vision** (v0.10.22-rc.20250304) - Modern Tasks API with PoseLandmarker

### Why Only Tasks Vision?

The legacy packages (`@mediapipe/pose` and `@mediapipe/camera_utils`) are **not compatible with Next.js** due to ES module issues. They were designed for browser globals and don't export properly in modern bundlers.

**Solution**: Use `@mediapipe/tasks-vision` which:
- ✅ Works seamlessly with Next.js and Turbopack
- ✅ Modern ES module support
- ✅ Better performance with GPU acceleration
- ✅ More features and actively maintained

## Test Component Created

### MediaPipe Vision Test (`src/components/mediapipe-vision-test.tsx`)
- Uses the **@mediapipe/tasks-vision API**
- Implements `PoseLandmarker` with `FilesetResolver`
- Real-time pose detection with video stream
- 33 body landmarks detection
- Modern API with better performance

## Test Page

Visit `/mediapipe-test` to test the implementation:

- **URL**: <http://localhost:3000/mediapipe-test>

## Usage

### Start Development Server

```bash
npm run dev
```

### Access Test Page

1. Navigate to http://localhost:3000
2. Click "MediaPipe Test →" button
3. Click "Start Camera" on either test component
4. Allow camera permissions when prompted

## Features

- ✅ Real-time pose detection
- ✅ Webcam integration
- ✅ Visual landmark rendering
- ✅ Skeleton connection drawing
- ✅ Error handling
- ✅ Loading states
- ✅ Start/Stop controls

## API Comparison

### Vision API (Recommended)
```typescript
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const vision = await FilesetResolver.forVisionTasks('...');
const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {...});
const results = poseLandmarker.detectForVideo(video, timestamp);
```

### Legacy Pose API
```typescript
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

const pose = new Pose({ locateFile: ... });
pose.setOptions({...});
pose.onResults(callback);
```

## Browser Requirements

- Modern browser with WebRTC support
- Camera permissions
- HTTPS or localhost (required for camera access)

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure you're on HTTPS or localhost
- Try a different browser

### Model Loading Issues
- Check internet connection (models load from CDN)
- Clear browser cache
- Check browser console for errors

## Next Steps

1. Test both implementations
2. Choose the API that works best for your use case
3. Customize pose detection parameters
4. Add additional MediaPipe features (hands, face, etc.)

## Resources

- [MediaPipe Documentation](https://developers.google.com/mediapipe)
- [Tasks Vision API Guide](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/web_js)
- [Legacy Pose API Guide](https://google.github.io/mediapipe/solutions/pose.html)
