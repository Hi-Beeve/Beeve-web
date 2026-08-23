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

export default function HexagonCharacterChart({
  fitness,
  width = 280,
  height = 280,
}: HexagonCharacterChartProps) {
  const index = getHexagonImageIndex(fitness);

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
        className="absolute w-full h-full object-contain"
        style={{ zIndex: 2 }}
      />
    </div>
  );
}
