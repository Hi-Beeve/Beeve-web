import { HexData } from "@/types/hex";
import {
  getCharacterImageSrc,
  getHexagonImageIndex,
  getHexagonImageSrc,
} from "@/utils/hexagon-image";

interface HexagonCharacterChartProps {
  fitness: HexData[];
  width?: number;
  height?: number;
}

// public/hexagon 이미지는 400x400 캔버스 안에 육각형이 약 60~65%만 차지하는 반면,
// public/character 이미지는 캐릭터가 캔버스를 훨씬 꽉 채워서 그려져 있어
// 같은 크기로 겹치면 캐릭터가 육각형보다 커 보인다. 캐릭터 레이어를 축소해 비율을 맞춘다.
const CHARACTER_SCALE = 0.77;

export default function HexagonCharacterChart({
  fitness,
  width = 280,
  height = 280,
}: HexagonCharacterChartProps) {
  const index = getHexagonImageIndex(fitness);
  const characterWidth = width * CHARACTER_SCALE;
  const characterHeight = height * CHARACTER_SCALE;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <img
        src={getHexagonImageSrc(index)}
        alt="hexagon-chart"
        className="absolute w-full h-full"
        style={{ zIndex: 1 }}
      />
      <img
        src={getCharacterImageSrc(index)}
        alt="character"
        className="absolute object-contain"
        style={{
          zIndex: 2,
          width: `${characterWidth}px`,
          height: `${characterHeight}px`,
          left: `${(width - characterWidth) / 2}px`,
          top: `${(height - characterHeight) / 2}px`,
        }}
      />
    </div>
  );
}
