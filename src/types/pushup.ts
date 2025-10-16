export type PushupType = 'wall' | 'knee' | 'standard';

export type PushupState = 'ready' | 'down' | 'up';

export interface PushupConfig {
  name: string;
  nameKo: string;
  description: string;
  icon: string;
  thresholds: {
    elbowDown: number;      // 팔꿈치 구부림 임계값
    elbowUp: number;        // 팔꿈치 펴기 임계값
    bodyAlignment: number;  // 몸통 정렬 임계값
    frameThreshold: number; // 프레임 안정성
    angleChangeMin: number; // 최소 각도 변화량
  };
  checkKnee?: boolean;      // 무릎 체크 여부
}

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}
