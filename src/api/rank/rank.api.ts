import { RankResponse } from "@/types/rank";
import instance from "../instance";

export const getRankApi = async () => {
    const response = await instance.get('/rank/age-group');
    return response;
    // return {data : mockData};
}

const mockData:RankResponse = {
    "rankHistoryList": [
      {
        "rank": 38,
        "date": '2025-11-30'
      },
      {
        "rank":33,
        "date": '2025-12-01'
      },
      {
        "rank":23,
        "date": '2025-12-06'
      },
      {
        "rank":14,
        "date": '2025-12-07'
      }
    ],
    "fitnessRankList": [
      {
        "type": "STRENGTH",
        "rank": 14
      },
        {
            type: "CARDIO",
            rank: 45,
        },
        {
            type: "ENDURANCE",
            rank: 36,
        },
        {
            type: "FLEXIBILITY",
            rank : 60
        },
        {
            type: "AGILITY",
            rank: 42
        },
        {
            type: "QUICKNESS",
            rank: 76
        }
    ]
}
