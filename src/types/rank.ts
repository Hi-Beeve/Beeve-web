import { FITNESS_TYPE } from "./hex";

export type RankHistory = {
    rank: number,
    date: string,
    sport: string,
    count: string,
}
export type RankResponse = {
    fitness: FITNESS_TYPE,
    historyList: RankHistory[],
}
// TODO : 이부분 수정 필요 , 종합등수 없음