import { useRankQuery } from "./queries";
import { RankResponse } from "@/types/rank";
import { HexData } from "@/types/hex";

export const useRank = () => {
    const query = useRankQuery();
    
    if (!query.data) return { ...query, data: undefined };
    
    const rawData: RankResponse = query.data;
    
    // rankHistoryList를 HexLineGraph 형식으로 변환
    const chartData = {
        labels: rawData.rankHistoryList.map(item => item.date),
        values: rawData.rankHistoryList.map(item => item.rank),
        icon: ""
    };
    
    // fitnessRankList를 HexData 형식으로 변환
    const fitnessData: HexData[] = rawData.fitnessRankList.map(item => ({
        fitnessType: item.type,
        program: "WALL_PUSH_UP" as const, // 기본값 (실제로는 사용되지 않음)
        value: 0, // 기본값 (실제로는 사용되지 않음)
        grade: item.rank
    }));
    
    const transformedData = {
        ...rawData,
        chartData,
        fitnessData
    };
    
    return { ...query, data: transformedData };
};
