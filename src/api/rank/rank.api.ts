import { RankResponse } from "@/types/rank";
import instance from "../instance";

export const getRankApi = async () => {
    const response = await instance.get('/rank/age-group');
    return response;
    // return {data : mockData};
}

const mockData:RankResponse = {
    "currentRank": {
        "percentile": 14
    },
    "rankHistoryList": [
      {
        "percentile": 38,
        "date": '2025-11-30'
      },
      {
        "percentile": 33,
        "date": '2025-12-01'
      },
      {
        "percentile": 23,
        "date": '2025-12-06'
      },
      {
        "percentile": 14,
        "date": '2025-12-07'
      }
    ],
    "fitnessRankList": [
      {
        "type": "STRENGTH",
        "percentile": 14
      },
      {
        type: "CARDIO",
        percentile: 45,
      },
      {
        type: "ENDURANCE",
        percentile: 36,
      },
      {
        type: "FLEXIBILITY",
        percentile: 60
      },
      {
        type: "AGILITY",
        percentile: 42
      },
      {
        type: "QUICKNESS",
        percentile: 76
      }
    ]
}
