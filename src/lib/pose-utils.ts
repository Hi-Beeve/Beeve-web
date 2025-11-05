import { Landmark } from '@/types/pushup';

/**
 * 3점 사이의 각도 계산
 * @param a - 첫 번째 점
 * @param b - 꼭지점 (중심점)
 * @param c - 세 번째 점
 * @returns 각도 (degree)
 */
export const calculateAngle = (a: Landmark, b: Landmark, c: Landmark): number => {
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

/**
 * 카메라 스트림 시작
 */
export const startCameraStream = async (
  videoRef: HTMLVideoElement
): Promise<MediaStream> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 640, height: 480 }
  });
  
  videoRef.srcObject = stream;
  
  return new Promise((resolve, reject) => {
    videoRef.onloadedmetadata = () => {
      videoRef.play().then(() => resolve(stream)).catch(reject);
    };
    videoRef.onerror = reject;
  });
};

/**
 * 카메라 스트림 중지
 */
export const stopCameraStream = (videoRef: HTMLVideoElement) => {
  const stream = videoRef.srcObject as MediaStream;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    videoRef.srcObject = null;
  }
};
