import { useRankQuery } from "./queries";
import { RankResponse } from "@/types/rank";
import { HexData } from "@/types/hex";

export const useRank = () => {
    const query = useRankQuery();

    if (!query.data) return { ...query, data: undefined };

    const rawData: RankResponse = query.data.data?.data ?? query.data.data;

    // rankHistoryList를 HexLineGraph 형식으로 변환
    const chartData = {
        labels: rawData.rankHistoryList?.map(item => item.date) ?? [],
        values: rawData.rankHistoryList?.map(item => item.percentile) ?? [],
        icon: ""
    };

    // fitnessRankList를 HexData 형식으로 변환
    const fitnessData: HexData[] = (rawData.fitnessRankList ?? []).map(item => ({
        fitnessType: item.type,
        program: "WALL_PUSH_UP" as const,
        value: 0,
        grade: item.percentile
    }));

    const transformedData = {
        ...rawData,
        chartData,
        fitnessData
    };

    return { ...query, data: transformedData };
};
