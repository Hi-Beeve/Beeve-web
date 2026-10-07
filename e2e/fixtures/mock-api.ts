import { expect, type Locator, type Page, type Route } from '@playwright/test';

/** 백엔드 API (src/api/instance.ts 의 baseURL) 경로 패턴 */
const API_PATTERN = /\/api\/v1\//;

export const KAKAO_USER = {
  id: 123456789,
  nickname: '테스트유저',
  email: 'e2e@beeve.test',
};

export const TOKENS = {
  accessToken: 'e2e-access-token-0123456789',
  refreshToken: 'e2e-refresh-token-0123456789',
  tokenType: 'Bearer',
  expiresIn: 3600,
  scope: '',
  refreshTokenExpiresIn: 86400,
};

/** 만 27세가 되는 생년월일 → 연령대 25~29 */
export const BIRTH_DATE = (() => {
  const d = new Date();
  return `${d.getFullYear() - 27}-01-01`;
})();

export const today = () => new Date().toISOString().split('T')[0];

export const PROFILE = {
  name: KAKAO_USER.nickname,
  birthDate: BIRTH_DATE,
  gender: 'M',
  height: 175,
  weight: 70,
  bmi: 22.9,
  profileUrl: '',
  aiConsent: true,
};

export const makeHexData = (measureDay = today()) => ({
  totalGrade: 2,
  totalPercentile: 30,
  measurePlace: 'HOME',
  height: 175,
  weight: 70,
  age: 27,
  gender: 'M',
  measureDay,
  fitness: [
    { fitnessType: 'STRENGTH', program: 'WALL_PUSH_UP', value: 25, rawValue: 25, grade: 1 },
    { fitnessType: 'CARDIO', program: 'VO2MAX', value: 42.5, grade: 2 },
    { fitnessType: 'FLEXIBILITY', program: 'SIT_AND_REACH', value: 15.5, grade: 2 },
    { fitnessType: 'QUICKNESS', program: 'FLIGHT_TIME', value: 0.45, grade: 3 },
    { fitnessType: 'AGILITY', program: 'REACTION_TIME', value: 0.35, grade: 1 },
    { fitnessType: 'ENDURANCE', program: 'CROSS_CRUNCH', value: 30, grade: 2 },
  ],
});

export const RANK = {
  currentRank: { percentile: 14 },
  rankHistoryList: [
    { percentile: 38, date: '2026-08-01' },
    { percentile: 23, date: '2026-09-01' },
    { percentile: 14, date: '2026-10-01' },
  ],
  fitnessRankList: [
    { type: 'STRENGTH', percentile: 14 },
    { type: 'CARDIO', percentile: 45 },
    { type: 'ENDURANCE', percentile: 36 },
    { type: 'FLEXIBILITY', percentile: 60 },
    { type: 'AGILITY', percentile: 42 },
    { type: 'QUICKNESS', percentile: 76 },
  ],
};

export type RecordedRequest = { method: string; path: string; body: any };

export type MockOptions = {
  /** 'existing' = 가입된 회원(로그인 성공), 'new' = 미가입(AUTH101 → 회원가입 이동) */
  member?: 'existing' | 'new';
  /** 측정 데이터가 이미 있는지 여부 (메인 페이지 상태) */
  hasHex?: boolean;
  /** AI 서비스 정보 제공 동의 여부 (false 면 /hex 진입 시 동의 모달 노출) */
  aiConsent?: boolean;
};

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', headers: CORS_HEADERS, body: JSON.stringify(body) });

const ok = (data: unknown) => ({ isSuccess: true, code: 'COMMON200', message: 'OK', data });

/**
 * 백엔드 API + 카카오 OAuth 를 모킹하고, 앱이 보낸 요청을 기록합니다.
 * 반환된 `requests` 배열로 요청 payload 를 검증할 수 있습니다.
 */
export async function mockBackend(page: Page, options: MockOptions = {}) {
  const state = {
    member: options.member ?? 'existing',
    profile: { ...PROFILE, aiConsent: options.aiConsent ?? true },
    hex: options.hasHex ? makeHexData() : null as ReturnType<typeof makeHexData> | null,
    requests: [] as RecordedRequest[],
  };

  // ---- 카카오 OAuth ----
  await page.route('https://kauth.kakao.com/oauth/authorize**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>kakao-authorize-mock</body></html>' }),
  );
  await page.route('https://kauth.kakao.com/oauth/token', (route) =>
    route.request().method() === 'OPTIONS'
      ? route.fulfill({ status: 204, headers: CORS_HEADERS })
      : json(route, { access_token: 'kakao-access-token', token_type: 'bearer', expires_in: 3600 }),
  );
  await page.route('https://kapi.kakao.com/v2/user/me', (route) =>
    route.request().method() === 'OPTIONS'
      ? route.fulfill({ status: 204, headers: CORS_HEADERS })
      : json(route, {
          id: KAKAO_USER.id,
          properties: { nickname: KAKAO_USER.nickname },
          kakao_account: { email: KAKAO_USER.email, profile: { nickname: KAKAO_USER.nickname } },
        }),
  );

  // ---- Beeve 백엔드 ----
  await page.route(API_PATTERN, async (route) => {
    const req = route.request();
    const method = req.method();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS_HEADERS });

    const url = new URL(req.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    let body: any = null;
    try {
      body = req.postDataJSON();
    } catch {
      body = req.postData();
    }
    state.requests.push({ method, path, body });

    switch (`${method} ${path}`) {
      case 'POST /auth/login':
        return state.member === 'existing'
          ? json(route, ok(TOKENS))
          : json(route, { isSuccess: false, code: 'AUTH101', message: '회원이 존재하지 않습니다.' }, 404);
      case 'POST /auth/signup':
        state.member = 'existing';
        return json(route, ok(TOKENS));
      case 'POST /auth/phone/send-code':
        return json(route, ok(null));
      case 'POST /auth/phone/verify-code':
        return json(route, ok({ verificationToken: 'e2e-verification-token' }));
      case 'POST /auth/email-login':
        return json(route, ok({ ...TOKENS, name: PROFILE.name, profileUrl: '' }));
      case 'POST /auth/logout':
        return json(route, ok(null));
      case 'GET /member/profile':
        return json(route, ok(state.profile));
      case 'PATCH /member/ai-consent':
        state.profile = { ...state.profile, aiConsent: body?.aiConsent };
        return json(route, ok({ aiConsent: state.profile.aiConsent }));
      case 'DELETE /member':
        return json(route, ok(null));
      case 'GET /fitness':
        return json(route, ok(state.hex));
      case 'GET /fitness/measure-days':
        return json(route, ok({ measureDates: state.hex ? [state.hex.measureDay] : [] }));
      case 'POST /fitness':
        state.hex = makeHexData();
        return json(route, ok(state.hex));
      case 'GET /rank/age-group':
        return json(route, ok(RANK));
      default:
        return json(route, ok(null));
    }
  });

  return state;
}

/**
 * 로그인된 상태로 시작하도록 localStorage 를 채웁니다.
 * (sessionStorage 플래그로 첫 로드에만 적용 → 로그아웃 테스트에 영향 없음)
 */
export async function seedLoggedIn(page: Page) {
  await page.addInitScript(
    ({ tokens, user, additional }) => {
      if (sessionStorage.getItem('__e2e_seeded')) return;
      sessionStorage.setItem('__e2e_seeded', '1');
      localStorage.setItem('authToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('userAdditionalInfo', JSON.stringify(additional));
    },
    {
      tokens: TOKENS,
      user: { id: String(KAKAO_USER.id), nickname: KAKAO_USER.nickname, email: KAKAO_USER.email, provider: 'kakao' },
      additional: { birthDate: BIRTH_DATE, gender: 'male', height: 175, weight: 70 },
    },
  );
}

/** 6각형(레이더) 차트가 배경 이미지와 함께 실제로 그려졌는지 확인 */
export async function expectHexagonRendered(scope: Page | Locator) {
  const bg = scope.locator('img[alt="hex-bg"]').first();
  await expect(bg).toBeVisible();
  await expect.poll(() => bg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

  // 차트 캔버스는 배경 이미지와 같은 컨테이너 안에 있음
  const canvas = bg.locator('xpath=..').locator('canvas');
  await expect(canvas).toBeVisible();

  // 애니메이션이 끝난 뒤 캔버스에 채워진(불투명) 픽셀이 충분히 있는지 확인
  await expect
    .poll(
      () =>
        canvas.evaluate((c: HTMLCanvasElement) => {
          const ctx = c.getContext('2d');
          if (!ctx || c.width === 0 || c.height === 0) return 0;
          const { data } = ctx.getImageData(0, 0, c.width, c.height);
          let filled = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 0) filled++;
          return filled;
        }),
      { message: '6각형 차트 캔버스에 그려진 영역이 있어야 합니다' },
    )
    .toBeGreaterThan(1000);
}

/** 6각형 + 캐릭터 이미지(체력 MBTI)가 기대한 인덱스로 로드되었는지 확인 */
export async function expectHexagonCharacterRendered(scope: Page | Locator, expectedIndex: number) {
  const hexagon = scope.locator('img[alt="hexagon-chart"]').first();
  const character = scope.locator('img[alt="character"]').first();

  await expect(hexagon).toBeVisible();
  await expect(character).toBeVisible();
  await expect(hexagon).toHaveAttribute('src', `/hexagon/${expectedIndex}.png`);
  await expect(character).toHaveAttribute('src', `/character/${expectedIndex}.png`);

  // 이미지 파일이 실제로 존재하고 로드되었는지 (깨진 이미지 방지)
  for (const img of [hexagon, character]) {
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }

  // 캐릭터가 육각형 영역 안쪽(중앙)에 겹쳐 그려지는지
  const [h, c] = [await hexagon.boundingBox(), await character.boundingBox()];
  expect(h && c).toBeTruthy();
  expect(c!.x).toBeGreaterThanOrEqual(h!.x);
  expect(c!.y).toBeGreaterThanOrEqual(h!.y);
  expect(c!.x + c!.width).toBeLessThanOrEqual(h!.x + h!.width + 1);
  expect(c!.y + c!.height).toBeLessThanOrEqual(h!.y + h!.height + 1);
}
