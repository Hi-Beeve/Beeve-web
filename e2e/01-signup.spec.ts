import { test, expect, type Page } from '@playwright/test';
import { KAKAO_USER, TOKENS, mockBackend } from './fixtures/mock-api';

/** 카카오 콜백 → 미가입 회원(AUTH101) → 추가정보 입력 페이지 진입 */
async function goToAdditionalInfo(page: Page) {
  await page.goto('/auth/kakao/callback?code=e2e-signup-code');
  await expect(page).toHaveURL(/\/auth\/additional-info/);
  await expect(page.getByRole('heading', { name: /^성별을/ })).toBeVisible();
}

test.describe('1. 회원가입', () => {
  test('신규 회원은 카카오 로그인 후 4단계 회원가입을 마치고 메인으로 이동한다', async ({ page }) => {
    const api = await mockBackend(page, { member: 'new' });
    await goToAdditionalInfo(page);
    await expect(page.getByText(`${KAKAO_USER.nickname}님의 맞춤형 운동 분석을 위해 필요해요`)).toBeVisible();

    // STEP 1. 성별 + 개인정보 동의
    await page.getByRole('button', { name: '남성' }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: '다음', exact: true }).click();

    // STEP 2. 생년월일 (기본값 2000-01-01 선택)
    await expect(page.getByRole('heading', { name: /^생년월일을/ })).toBeVisible();
    await page.getByText('연.월.일').click();
    await expect(page.getByText('생년월일 선택')).toBeVisible();
    await page.getByRole('button', { name: '확인', exact: true }).click();
    await expect(page.getByText('2000.01.01')).toBeVisible();
    await page.getByRole('button', { name: '다음', exact: true }).click();

    // STEP 3. 키 / 체중
    await expect(page.getByRole('heading', { name: /^키와 체중을/ })).toBeVisible();
    const [height, weight] = await page.locator('input[type="number"]').all();
    await height.fill('175');
    await weight.fill('70');
    await page.getByRole('button', { name: '다음', exact: true }).click();

    // STEP 4. 휴대폰 인증
    await expect(page.getByRole('heading', { name: /^휴대폰 번호를/ })).toBeVisible();
    const submit = page.getByRole('button', { name: '가입 완료' });
    await expect(submit).toBeDisabled();
    await page.getByPlaceholder('01012345678').fill('010-1234-5678');
    await page.getByRole('button', { name: '인증번호 발송' }).click();
    await expect(page.getByText('인증번호가 발송되었습니다.')).toBeVisible();
    await page.getByPlaceholder('인증번호 6자리').fill('123456');
    await page.getByRole('button', { name: '확인', exact: true }).click();
    await expect(page.getByText('인증 완료', { exact: true })).toBeVisible();
    await expect(submit).toBeEnabled();
    await submit.click();

    // 가입 완료 → 메인(/hex) 이동 + 토큰 저장
    await expect(page).toHaveURL(/\/hex$/);
    await expect(page.getByText(`Hello! ${KAKAO_USER.nickname}`)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('authToken'))).toBe(TOKENS.accessToken);
    expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe(TOKENS.refreshToken);

    // 서버로 전송된 회원가입 payload 검증
    const signup = api.requests.find((r) => r.method === 'POST' && r.path === '/auth/signup');
    expect(signup?.body).toMatchObject({
      provider: 'KAKAO',
      providerUserId: String(KAKAO_USER.id),
      name: KAKAO_USER.nickname,
      email: KAKAO_USER.email,
      gender: 'M',
      birthDate: '2000-01-01',
      height: 175,
      weight: 70,
      phoneNumber: '01012345678',
      verificationToken: 'e2e-verification-token',
    });
  });

  test('개인정보 동의와 성별 선택 없이는 다음 단계로 갈 수 없다', async ({ page }) => {
    await mockBackend(page, { member: 'new' });
    await goToAdditionalInfo(page);

    await page.getByRole('button', { name: '다음', exact: true }).click();
    await expect(page.getByText('개인정보 수집·이용에 동의해주세요.').first()).toBeVisible();

    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: '다음', exact: true }).click();
    await expect(page.getByText('성별을 선택해주세요.').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /^성별을/ })).toBeVisible();
  });

  test('키/체중 범위를 벗어나면 에러를 표시한다', async ({ page }) => {
    await mockBackend(page, { member: 'new' });
    await goToAdditionalInfo(page);

    await page.getByRole('button', { name: '여성' }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: '다음', exact: true }).click();
    await page.getByText('연.월.일').click();
    await page.getByRole('button', { name: '확인', exact: true }).click();
    await page.getByRole('button', { name: '다음', exact: true }).click();

    const [height, weight] = await page.locator('input[type="number"]').all();
    await height.fill('90');
    await weight.fill('70');
    await page.getByRole('button', { name: '다음', exact: true }).click();
    await expect(page.getByText('키를 올바르게 입력해주세요. (100-250cm)').first()).toBeVisible();

    await height.fill('170');
    await weight.fill('250');
    await page.getByRole('button', { name: '다음', exact: true }).click();
    await expect(page.getByText('체중을 올바르게 입력해주세요. (30-200kg)').first()).toBeVisible();
  });

  test('소셜 로그인 정보 없이 추가정보 페이지에 접근하면 첫 화면으로 돌려보낸다', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/auth/additional-info');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('카카오로 시작하기')).toBeVisible();
  });
});
