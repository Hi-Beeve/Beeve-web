import { FITNESS_TYPE } from "./hex";

export type RankHistory = {
    percentile: number,
    date: string,
}
export type RankResponse = {
    currentRank: {
        percentile: number,
    },
    rankHistoryList: RankHistory[],
    fitnessRankList: {type: FITNESS_TYPE, percentile: number}[],
}
