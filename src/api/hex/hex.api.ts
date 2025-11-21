import instance from '@/api/instance';
import { HexWithDateRequest, HexWithDateResponse } from '@/types/hex';

export const hexWithDateApi = async (params: HexWithDateRequest): Promise<HexWithDateResponse> => {
  // const response = await instance.get<HexWithDateResponse>('/hex/data', {
  //   params,
  // });
  // 임시 mock 데이터 반환하도록 주석처리 
  
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve(mockHexData);
    }, 1000)
  })
};
export const getHexDateListApi = async (): Promise<string[]> => {
  // 실제 서버 연동 시 아래 주석 해제
  // const response = await instance.get<string[]>('/hex/dates');
  // return response.data;

  // MOCK
  return ['2025-11-17', '2025-02-12', '2024-03-08','2024-11-17', '2023-02-12', '2022-03-08','2022-11-17', '2021-02-12', '2020-03-08'];
};


const mockHexData: HexWithDateResponse = {
  totalGrade: 1,
  totalRank: 3,
  measurePlace: "GYM",
  height: 166.88,
  weight: 56.88,
  age: 34,
  
  fitness: [
    {
      fitnessType: "STRENGTH",
      program: "WALL_PUSH_UP",
      value: 22,
      rawValue: 30,
      grade: 1
    },
    {
      fitnessType: "CARDIO",
      program: "VO2MAX",
      value: 50,
      grade: 1
    },
    {
      fitnessType: "ENDURANCE",
      program: "CROSS_CRUNCH",
      value: 20,
      grade: 2
    },
    {
      fitnessType: "FLEXIBILITY",
      program: "SIT_AND_REACH",
      value: 17,
      grade: 3
    },
    {
      fitnessType: "AGILITY",
      program: "REACTION_TIME",
      value: 0.223,
      grade: 2
    },
    {
      fitnessType: "QUICKNESS",
      program: "FLIGHT_TIME",
      value: 0.941,
      grade: 2
    }
  ],

    // name: 'John Doe',
    // profileImage: 'https://example.com/profile.jpg',
  date: '2025-11-17',
  gender: "MALE",

};