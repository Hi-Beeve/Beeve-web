interface FitnessGradeBarProps {
  grade: number; // 1(최고) ~ 4(최저)
}

const SEGMENT_COUNT = 4;
const FILLED_COLOR = "#BDB2DD";
const EMPTY_COLOR = "#D9D9D9";
const BAR_WIDTH = 160;
const BAR_HEIGHT = 8;
const CORNER_RADIUS = 10;

export default function FitnessGradeBar({ grade }: FitnessGradeBarProps) {
  const clampedGrade = Math.min(Math.max(grade, 1), SEGMENT_COUNT);
  const filledCount = SEGMENT_COUNT - clampedGrade + 1;

  return (
    <div
      className="flex gap-[1px]"
      style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}
    >
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-full"
          style={{
            backgroundColor: i < filledCount ? FILLED_COLOR : EMPTY_COLOR,
            borderRadius:
              i === 0
                ? `${CORNER_RADIUS}px 0 0 ${CORNER_RADIUS}px`
                : i === SEGMENT_COUNT - 1
                ? `0 ${CORNER_RADIUS}px ${CORNER_RADIUS}px 0`
                : 0,
          }}
        />
      ))}
    </div>
  );
}
