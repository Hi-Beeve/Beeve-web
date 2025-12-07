import { FITNESS_TYPE } from "./hex";

export type RankHistory = {
    rank: number,
    date: string,
}
export type RankResponse = {
    rankHistoryList: RankHistory[],
    fitnessRankList: {type:FITNESS_TYPE,rank:number}[],
}