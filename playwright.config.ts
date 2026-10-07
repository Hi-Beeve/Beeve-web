import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 3001);
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Beeve-web E2E 테스트 설정
 *
 * - 백엔드 API와 카카오 OAuth는 e2e/fixtures/mock-api.ts 에서 모두 모킹합니다.
 *   (실제 서버/카카오 계정 없이 프론트엔드 흐름만 검증)
 * - Playwright 전용 Chromium 대신 로컬 Chrome을 쓰려면 PW_CHANNEL=chrome 으로 실행하세요.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    channel: process.env.PW_CHANNEL || undefined,
    viewport: { width: 390, height: 844 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npx next dev -H localhost -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || 'e2e-kakao-client-id',
      NEXT_PUBLIC_KAKAO_REDIRECT_URI: `${BASE_URL}/auth/kakao/callback`,
    },
  },
});
