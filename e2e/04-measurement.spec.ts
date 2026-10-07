import { test, expect } from '@playwright/test';
import { KAKAO_USER, expectHexagonCharacterRendered, expectHexagonRendered, makeHexData, mockBackend, seedLoggedIn } from './fixtures/mock-api';
import { getHexagonImageIndex } from '../src/utils/hexagon-image';
import { getFitnessMbtiById } from '../src/config/fitness-mbti';
import type { HexData } from '../src/types/hex';

// 모킹된 측정 결과로 기대되는 체력 MBTI (앱과 동일한 로직으로 계산)
const FITNESS = makeHexData().fitness as HexData[];
const MBTI_INDEX = getHexagonImageIndex(FITNESS);
const MBTI = getFitnessMbtiById(MBTI_INDEX);

/**
 * 실제 측정(카메라/MediaPipe)은 자동화가 어려우므로,
 * 측정 페이지의 "Fill with test data (for review)" 버튼으로 6개 항목을 채운 뒤
 * 결과 전송 → 결과 페이지의 6각형 + 캐릭터(체력 MBTI) 표출까지 검증합니다.
 */
test.describe('4. 체력측정 → 6각형 캐릭터 결과', () => {
  test.beforeEach(async ({ page }) => {
    await seedLoggedIn(page);
  });

  test('사전 설문을 마치면 측정 페이지로 이동한다', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/pre-servey');

    // 1) 신체정보 확인
    await expect(page.getByText(`${KAKAO_USER.nickname}님의`)).toBeVisible();
    await expect(page.getByText('남성')).toBeVisible();
    await expect(page.getByText('175cm')).toBeVisible();
    await expect(page.getByText('70kg')).toBeVisible();
    await page.getByRole('button', { name: '다음' }).click();

    // 2) 측정 장소 – 선택 전에는 다음 비활성
    await expect(page.getByText('측정 장소를 선택해주세요.')).toBeVisible();
    await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
    await page.getByText('집', { exact: true }).click();
    await page.getByRole('button', { name: '다음' }).click();

    // 3) 점검사항 – 모두 체크해야 다음 활성
    await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
    await page.getByText('안전한 공간을 만들어주세요').click();
    await page.getByText('카메라를 점검해주세요').click();
    await page.getByText('소리를 점검해주세요').click();
    await page.getByRole('button', { name: '다음' }).click();

    await expect(page).toHaveURL(/\/measurement$/);
    const preSurvey = await page.evaluate(() => JSON.parse(localStorage.getItem('preSurvey') || '{}'));
    expect(preSurvey.place).toBe('집');
  });

  test('측정 항목 6개가 표시되고, 완료 전에는 결과 버튼이 비활성이다', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/measurement');

    await expect(page.getByText('체력 측정하기')).toBeVisible();
    for (const name of ['근력', '근지구력', '심폐지구력', '유연성', '민첩성', '순발력']) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
  });

  test('모든 측정을 마치고 제출하면 결과 페이지에 6각형 + 캐릭터가 표출된다', async ({ page }) => {
    const api = await mockBackend(page, { hasHex: false });
    await page.goto('/measurement');

    page.once('dialog', (dialog) => dialog.accept()); // "임의 측정 데이터가 채워졌습니다!" alert
    await page.getByRole('button', { name: 'Fill with test data (for review)' }).click();

    await expect(page.getByText('선택한 강도: 7 / 10')).toBeVisible();
    const submit = page.getByRole('button', { name: '6각형 체력 결과 확인하기' });
    await expect(submit).toBeEnabled();
    await submit.click();

    // 결과 페이지
    await expect(page).toHaveURL(/\/measurement\/result$/);
    await expect(page.getByRole('heading', { name: '체력 MBTI', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: `당신의 체력 MBTI는 ${MBTI.animalName}입니다!` })).toBeVisible();
    await expectHexagonCharacterRendered(page, MBTI_INDEX);
    await expect(page.getByText(`가장 강한 체력 : ${MBTI.strongestLabel}`)).toBeVisible();
    await expect(page.getByText(`가장 약한 체력 : ${MBTI.weakestLabel}`)).toBeVisible();
    await expect(page.getByRole('button', { name: '친구와 공유하기' })).toBeVisible();

    // 서버로 전송된 측정 데이터 검증
    const posted = api.requests.find((r) => r.method === 'POST' && r.path === '/fitness');
    expect(posted?.body).toMatchObject({
      measurePlace: 'HOME',
      wallPushUpReps: 25,
      stepTestRecoveryBpm: 85,
      crossCrunchReps: 30,
      sitAndReach: 15.5,
      reactionTime: 0.35,
      flightTime: 0.45,
      rpe: 7,
    });

    // 홈으로 이동하면 메인의 6각형 차트가 표시된다
    await page.getByRole('button', { name: '홈으로' }).click();
    await expect(page).toHaveURL(/\/hex$/);
    await expect(page.getByText('6-Data')).toBeVisible();
    await expectHexagonRendered(page);
  });

  test('결과 조회에 실패하면 안내 문구를 보여준다', async ({ page }) => {
    await mockBackend(page, { hasHex: false });
    await page.goto('/measurement/result');
    await expect(page.getByText('측정 결과를 불러올 수 없습니다.')).toBeVisible();
  });
});
