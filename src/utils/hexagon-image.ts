import { FITNESS_TYPE, HexData } from "@/types/hex";

// public/hexagon, public/character 이미지 생성 시 사용한 카테고리 고정 순서
// (tools/hexagon-generator/hexagon_chart_generator.html의 CATEGORIES와 동일)
const CATEGORY_ORDER: FITNESS_TYPE[] = [
  "STRENGTH",
  "ENDURANCE",
  "CARDIO",
  "FLEXIBILITY",
  "QUICKNESS",
  "AGILITY",
];

/**
 * grade 배열(강점/약점 조합)을 기준으로 public/hexagon, public/character의
 * 1~36 이미지 인덱스를 계산한다. grade는 1(최고)~4(최저).
 * 동률은 CATEGORY_ORDER 우선순위로 해소하고, 강점을 제외한 나머지 5개가
 * 전부 동률이라 뚜렷한 약점이 없으면 강점=약점 특수 인덱스(31~36)를 반환한다.
 */
export function getHexagonImageIndex(fitness: HexData[]): number {
  const gradeByType = new Map(fitness.map((f) => [f.fitnessType, f.grade]));
  const grades = CATEGORY_ORDER.map((type) => gradeByType.get(type) ?? 4);

  let strongestIdx = 0;
  for (let i = 1; i < grades.length; i++) {
    if (grades[i] < grades[strongestIdx]) strongestIdx = i;
  }

  let weakestIdx = -1;
  for (let i = 0; i < grades.length; i++) {
    if (i === strongestIdx) continue;
    if (weakestIdx === -1 || grades[i] > grades[weakestIdx]) weakestIdx = i;
  }

  const restGrades = grades.filter((_, i) => i !== strongestIdx);
  const noDistinctWeakest = restGrades.every((g) => g === restGrades[0]);

  if (noDistinctWeakest) {
    return 30 + strongestIdx + 1; // 31~36: 강점=약점
  }

  const remainingOrder = CATEGORY_ORDER.filter((_, i) => i !== strongestIdx);
  const weakestRank = remainingOrder.indexOf(CATEGORY_ORDER[weakestIdx]);

  return strongestIdx * 5 + weakestRank + 1; // 1~30
}

export function getHexagonImageSrc(index: number): string {
  return `/hexagon/${index}.png`;
}

export function getCharacterImageSrc(index: number): string {
  return `/character/${index}.png`;
}
