export type SitupState = 'ready' | 'down' | 'up';

export interface SitupConfig {
  name: string;
  description: string;
  thresholds: {
    kneeElbowDistance: number; // 무릎-팔꿈치 거리 임계값 (픽셀)
    bodyAngle: number; // 몸통 각도 임계값 (도)
  };
}

export const SITUP_CONFIG: SitupConfig = {
  name: '싯업',
  description: '무릎을 세우고 누워서 팔꿈치가 무릎에 닿도록 상체를 올리는 운동',
  thresholds: {
    kneeElbowDistance: 100, // 팔꿈치와 무릎 사이 거리 (픽셀) - 유클리드 거리로 계산하므로 증가
    bodyAngle: 80, // 상체 각도 (옆에서 측정) - 70도 이하일 때 UP으로 인식, 여유있게 80도
  },
};
