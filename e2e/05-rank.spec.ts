import { test, expect } from '@playwright/test';
import { RANK, mockBackend, seedLoggedIn } from './fixtures/mock-api';

const NAME: Record<string, string> = {
  STRENGTH: '근력',
  CARDIO: '심폐지구력',
  ENDURANCE: '근지구력',
  FLEXIBILITY: '유연성',
  AGILITY: '민첩성',
  QUICKNESS: '순발력',
};

test.describe('5. 랭킹 페이지 (/hex/rank)', () => {
  test.beforeEach(async ({ page }) => {
    await seedLoggedIn(page);
    await mockBackend(page, { hasHex: true });
  });

  test('연령대, 동년배 상위 백분위, 추이 그래프가 표시된다', async ({ page }) => {
    await page.goto('/hex/rank');

    // 생년월일(만 27세) 기준 연령대
    await expect(page.getByText('25~29세 중')).toBeVisible();
    await expect(page.getByText('나의 체력')).toBeVisible();

    await expect(page.getByText('동년배 상위')).toBeVisible();
    await expect(page.getByText(`${RANK.currentRank.percentile}%`, { exact: true })).toBeVisible();

    // 순위 추이 라인 그래프
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('항목별 상위 백분위 카드 6개가 표시된다', async ({ page }) => {
    await page.goto('/hex/rank');

    await expect(page.getByText('항목별')).toBeVisible();
    await expect(page.getByText('동년배 중 나의 상위 백분위')).toBeVisible();

    for (const { type, percentile } of RANK.fitnessRankList) {
      const card = page.locator('div', { has: page.getByText(NAME[type], { exact: true }) })
        .filter({ hasText: `상위 ${percentile}%` })
        .last();
      await expect(card).toBeVisible();
    }
  });
});
