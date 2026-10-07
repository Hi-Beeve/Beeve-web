import { test, expect } from '@playwright/test';
import { KAKAO_USER, expectHexagonCharacterRendered, expectHexagonRendered, makeHexData, mockBackend, seedLoggedIn } from './fixtures/mock-api';
import { getHexagonImageIndex } from '../src/utils/hexagon-image';
import { getFitnessMbtiById } from '../src/config/fitness-mbti';
import type { HexData } from '../src/types/hex';

test.describe('3. 메인페이지 (/hex)', () => {
  test.beforeEach(async ({ page }) => {
    await seedLoggedIn(page);
  });

  test('측정 기록이 없으면 6각 체력 측정 안내가 보이고, 측정 페이지로 이동할 수 있다', async ({ page }) => {
    await mockBackend(page, { hasHex: false });
    await page.goto('/hex');

    await expect(page.getByText(`Hello! ${KAKAO_USER.nickname}`)).toBeVisible();
    await expect(page.getByText('당신의 6각 체력을 측정해보세요.').first()).toBeVisible();

    await page.getByRole('button', { name: '6각 체력 측정하기' }).first().click();
    await expect(page).toHaveURL(/\/measurement$/);
  });

  test('측정 기록이 있으면 6각형 차트와 체력 카드가 표시된다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await page.goto('/hex');

    await expect(page.getByText('6-Data')).toBeVisible();
    await expect(page.getByText('체력측정 6각형')).toBeVisible();
    await expectHexagonRendered(page);

    // 요약 카드
    await expect(page.getByText('175cm / 70kg')).toBeVisible();
    await expect(page.getByText('27세')).toBeVisible();
    await expect(page.getByText('2등급').first()).toBeVisible(); // 종합 등급 카드
    await expect(page.getByText('30등')).toBeVisible();

    // 6개 체력 항목
    await expect(page.getByText('체력항목')).toBeVisible();
    for (const name of ['근력', '심폐지구력', '유연성', '순발력', '민첩성', '근지구력']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });

  test('하단 탭바로 순위 페이지와 마이페이지로 이동할 수 있다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await page.goto('/hex');
    await expect(page.getByText('6-Data')).toBeVisible();

    await page.getByRole('link', { name: '순위' }).click();
    await expect(page).toHaveURL(/\/hex\/rank$/);

    await page.getByRole('link', { name: '홈' }).click();
    await expect(page).toHaveURL(/\/hex$/);

    await page.getByText(`Hello! ${KAKAO_USER.nickname}`).click();
    await expect(page).toHaveURL(/\/mypage$/);
  });

  test('6-Data 옆 버튼으로 체력 MBTI(6각형 + 캐릭터) 화면을 볼 수 있다', async ({ page }) => {
    await mockBackend(page, { hasHex: true });
    await page.goto('/hex');
    await page.getByRole('button', { name: '체력 MBTI 결과 보기' }).click();

    await expect(page).toHaveURL(/\/hex\/mbti\?date=/);
    const index = getHexagonImageIndex(makeHexData().fitness as HexData[]);
    await expect(page.getByText(getFitnessMbtiById(index).animalName).first()).toBeVisible();
    await expectHexagonCharacterRendered(page, index);

    await page.getByRole('button', { name: '뒤로가기' }).click();
    await expect(page).toHaveURL(/\/hex$/);
  });

  test('AI 정보 제공에 동의하지 않은 회원은 동의 모달이 뜨고, 동의하면 닫힌다', async ({ page }) => {
    const api = await mockBackend(page, { hasHex: true, aiConsent: false });
    await page.goto('/hex');

    await expect(page.getByText('AI 서비스 이용 동의')).toBeVisible();
    await page.getByRole('button', { name: '동의하고 시작하기' }).click();
    await expect(page.getByText('AI 서비스 이용 동의')).toBeHidden();

    const req = api.requests.find((r) => r.method === 'PATCH' && r.path === '/member/ai-consent');
    expect(req?.body).toEqual({ aiConsent: true });
  });
});
