import HexagonCharacterChart from "@/components/hexagon-character-chart";
import FitnessGradeBar from "@/components/fitness-grade-bar";
import { getFitnessMbtiById } from "@/config/fitness-mbti";
import { getHexagonImageIndex } from "@/utils/hexagon-image";
import { FONT_COLORS, FONT_STYLES } from "@/styles/fontStyles";
import { HexData } from "@/types/hex";

interface FitnessMbtiCardProps {
  fitness: HexData[];
}

// 체력 측정 결과(강점/약점 조합)를 "체력 MBTI" 캐릭터 카드로 보여주는 컴포넌트.
// 마이페이지, 메인페이지 등 다른 화면에서도 fitness 데이터만 넘기면 재사용 가능.
export default function FitnessMbtiCard({ fitness }: FitnessMbtiCardProps) {
  const id = getHexagonImageIndex(fitness);
  const mbti = getFitnessMbtiById(id);
  const gradeByType = new Map(fitness.map((f) => [f.fitnessType, f.grade]));
  const strongestGrade = gradeByType.get(mbti.strongest) ?? 1;
  const weakestGrade = gradeByType.get(mbti.weakest) ?? 4;

  return (
    <div className="w-full bg-white rounded-[24px] px-6 py-8 flex flex-col items-center">
      <h2 className={`${FONT_STYLES.heading4} text-center mb-6`}>
        당신의 체력 MBTI는{" "}
        <span style={{ color: "#5A01A7" }}>{mbti.animalName}</span>입니다!
      </h2>

      <HexagonCharacterChart fitness={fitness} width={374} height={374} />

      <p className={`${FONT_STYLES.body6} text-center mt-6 mb-5`}>
        {mbti.animalName} 체력유형은...
      </p>

      <div className="w-full flex flex-col gap-4 mb-6">
        <div className="w-full flex items-center justify-between gap-3">
          <span className={FONT_STYLES.body9}>
            가장 강한 체력 : {mbti.strongestLabel}
          </span>
          <FitnessGradeBar grade={strongestGrade} />
        </div>
        <div className="w-full flex items-center justify-between gap-3">
          <span className={FONT_STYLES.body9}>
            가장 약한 체력 : {mbti.weakestLabel}
          </span>
          <FitnessGradeBar grade={weakestGrade} />
        </div>
      </div>

      <ul className="w-full list-disc pl-5 flex flex-col gap-1.5">
        {mbti.animalDescriptionBullets.map((bullet, i) => (
          <li key={i} className={`${FONT_STYLES.body10} ${FONT_COLORS.grey}`}>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
