import { PushupType, PushupConfig } from '@/types/pushup';

export const PUSHUP_CONFIGS: Record<PushupType, PushupConfig> = {
  wall: {
    name: 'Wall Pushup',
    nameKo: '벽 대고 푸시업',
    description: '초보자를 위한 가장 쉬운 푸시업. 벽에 손을 대고 실시합니다.',
    icon: '🧱',
    thresholds: {
      elbowDown: 140,      // 벽 푸시업은 각도가 덜 구부러짐
      elbowUp: 170,        // 거의 완전히 펴야 함
      bodyAlignment: 100,  // 몸통 체크 완화
      frameThreshold: 3,
      angleChangeMin: 25,  // 각도 변화 완화
    },
  },
  knee: {
    name: 'Knee Pushup',
    nameKo: '무릎 대고 푸시업',
    description: '무릎을 바닥에 대고 실시하는 중급 난이도 푸시업입니다.',
    icon: '🦵',
    thresholds: {
      elbowDown: 120,      // 중간 정도 구부림
      elbowUp: 160,
      bodyAlignment: 130,  // 중간 정도 체크
      frameThreshold: 3,
      angleChangeMin: 35,
    },
    checkKnee: true,       // 무릎-엉덩이-어깨 정렬 체크
  },
  standard: {
    name: 'Standard Pushup',
    nameKo: '정자세 푸시업',
    description: '발끝과 손으로만 지탱하는 표준 푸시업입니다.',
    icon: '💪',
    thresholds: {
      elbowDown: 115,      // 현재 설정과 동일
      elbowUp: 155,
      bodyAlignment: 120,  // 엄격한 체크
      frameThreshold: 3,
      angleChangeMin: 45,
    },
  },
};
