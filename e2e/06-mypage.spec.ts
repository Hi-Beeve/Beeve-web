import { test, expect } from '@playwright/test';
import { PROFILE, mockBackend, seedLoggedIn } from './fixtures/mock-api';

test.describe('6. 마이페이지 (/mypage)', () => {
  test.beforeEach(async ({ page }) => {
    await seedLoggedIn(page);
  });

  test('프로필 이름, 메뉴, BMI, 앱 정보가 표시된다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await page.goto('/mypage');

    await expect(page.getByRole('heading', { name: PROFILE.name })).toBeVisible();
    await expect(page.getByText('프로필 수정')).toBeVisible();
    await expect(page.getByText('운동정보 수정')).toBeVisible();
    await expect(page.getByText('AI 서비스 정보 제공 동의')).toBeVisible();

    // BMI 22.9 → 정상
    await expect(page.getByText('BMI', { exact: true })).toBeVisible();
    await expect(page.getByText(String(PROFILE.bmi), { exact: true })).toBeVisible();
    await expect(page.getByText('정상 (18.5~22.9)')).toBeVisible();

    await expect(page.getByText('앱정보')).toBeVisible();
    await expect(page.getByText('1.0.0')).toBeVisible();
  });

  test('프로필 수정 메뉴로 이동할 수 있다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await page.goto('/mypage');
    await page.getByText('프로필 수정').click();
    await expect(page).toHaveURL(/\/mypage\/edit$/);
  });

  test('뒤로가기를 누르면 메인으로 이동한다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await page.goto('/mypage');
    await page.getByAltText('arrow-left').click();
    await expect(page).toHaveURL(/\/hex$/);
  });

  test('로그아웃하면 토큰이 삭제되고 첫 화면으로 이동한다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await page.goto('/mypage');
    await expect(page.getByRole('heading', { name: PROFILE.name })).toBeVisible();

    await page.getByRole('button', { name: '로그아웃' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: /카카오로 시작하기/ })).toBeVisible();

    const storage = await page.evaluate(() => ({
      authToken: localStorage.getItem('authToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      userData: localStorage.getItem('userData'),
    }));
    expect(storage).toEqual({ authToken: null, refreshToken: null, userData: null });
  });

  test('AI 서비스 정보 제공 동의 토글을 끄면 서버에 반영된다', async ({ page }) => {
    const api = await mockBackend(page, { hasHex: true, aiConsent: true });
    await page.goto('/mypage');

    const row = page.locator('div', { has: page.getByText('AI 서비스 정보 제공 동의', { exact: true }) }).last();
    await row.getByRole('button').click();

    await expect.poll(() => api.requests.find((r) => r.method === 'PATCH' && r.path === '/member/ai-consent')?.body)
      .toEqual({ aiConsent: false });
  });

  test('회원탈퇴는 확인 모달을 거쳐 탈퇴 후 첫 화면으로 이동한다', async ({ page }) => {
    const api = await mockBackend(page, { hasHex: true });
    await page.goto('/mypage');

    await page.getByRole('button', { name: '회원탈퇴' }).click();
    await expect(page.getByText('정말 탈퇴하시겠습니까?')).toBeVisible();

    // 취소하면 모달만 닫힌다
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByText('정말 탈퇴하시겠습니까?')).toBeHidden();
    expect(api.requests.some((r) => r.method === 'DELETE' && r.path === '/member')).toBe(false);

    await page.getByRole('button', { name: '회원탈퇴' }).click();
    await page.getByRole('button', { name: '탈퇴하기' }).click();

    await expect(page).toHaveURL(/\/$/);
    expect(api.requests.some((r) => r.method === 'DELETE' && r.path === '/member')).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('authToken'))).toBeNull();
  });
});
