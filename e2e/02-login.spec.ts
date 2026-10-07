import { test, expect } from '@playwright/test';
import { KAKAO_USER, TOKENS, mockBackend, seedLoggedIn } from './fixtures/mock-api';

test.describe('2. 로그인', () => {
  test('첫 화면에 애플/구글/카카오 로그인 버튼과 이메일 로그인 링크가 보인다', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/');
    await expect(page.getByAltText('splash')).toBeVisible();
    await expect(page.getByRole('button', { name: /애플로 시작하기/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /구글로 시작하기/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /카카오로 시작하기/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in with Email' })).toHaveAttribute('href', '/auth/login');
  });

  test('카카오 버튼을 누르면 카카오 인가 페이지로 이동한다', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/');
    await page.getByRole('button', { name: /카카오로 시작하기/ }).click();

    await page.waitForURL(/kauth\.kakao\.com\/oauth\/authorize/);
    const url = new URL(page.url());
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBeTruthy();
    expect(url.searchParams.get('redirect_uri')).toMatch(/\/auth\/kakao\/callback$/);
  });

  test('기존 회원은 카카오 콜백 후 토큰이 저장되고 메인으로 이동한다', async ({ page }) => {
    const api = await mockBackend(page, { member: 'existing' });
    await page.goto('/auth/kakao/callback?code=e2e-login-code');

    await expect(page).toHaveURL(/\/hex$/);
    await expect(page.getByText(`Hello! ${KAKAO_USER.nickname}`)).toBeVisible();

    const storage = await page.evaluate(() => ({
      authToken: localStorage.getItem('authToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      userData: JSON.parse(localStorage.getItem('userData') || 'null'),
    }));
    expect(storage.authToken).toBe(TOKENS.accessToken);
    expect(storage.refreshToken).toBe(TOKENS.refreshToken);
    expect(storage.userData).toMatchObject({ id: String(KAKAO_USER.id), nickname: KAKAO_USER.nickname, provider: 'kakao' });

    const login = api.requests.find((r) => r.method === 'POST' && r.path === '/auth/login');
    expect(login?.body).toEqual({ provider: 'KAKAO', providerUserId: String(KAKAO_USER.id) });
  });

  test('카카오 로그인 취소(error 파라미터) 시 실패 화면을 보여준다', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/auth/kakao/callback?error=access_denied&error_description=사용자가 취소했습니다');
    await expect(page.getByText('로그인 실패')).toBeVisible();
    await expect(page.getByText('사용자가 취소했습니다')).toBeVisible();
  });

  test('이메일 로그인(심사용 계정) 성공 시 메인으로 이동한다', async ({ page }) => {
    const api = await mockBackend(page, { hasHex: true });
    await page.goto('/auth/login');

    await page.getByPlaceholder('Email').fill('beeve@gmail.com');
    await page.getByPlaceholder('Password').fill('e2e-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/hex$/);
    expect(await page.evaluate(() => localStorage.getItem('authToken'))).toBe(TOKENS.accessToken);
    const req = api.requests.find((r) => r.path === '/auth/email-login');
    expect(req?.body).toEqual({ email: 'beeve@gmail.com', password: 'e2e-password' });
  });

  test('등록되지 않은 이메일은 에러를 표시하고 서버에 요청하지 않는다', async ({ page }) => {
    const api = await mockBackend(page);
    await page.goto('/auth/login');

    await page.getByPlaceholder('Email').fill('unknown@beeve.test');
    await page.getByPlaceholder('Password').fill('pw');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('This email is not registered.')).toBeVisible();
    expect(api.requests.some((r) => r.path === '/auth/email-login')).toBe(false);
  });

  test('이미 로그인된 상태로 첫 화면에 오면 메인으로 리다이렉트된다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await seedLoggedIn(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/hex$/);
  });

  test('이미 로그인된 상태로 로그인 페이지에 오면 메인으로 리다이렉트된다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await seedLoggedIn(page);
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/hex$/);
  });
});
