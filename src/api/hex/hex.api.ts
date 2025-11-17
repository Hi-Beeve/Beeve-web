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
  user: {
    id: '1',
    name: 'John Doe',
    profileImage: 'https://example.com/profile.jpg',
    height: 180,
    weight: 70,
    age: 30,
  },
  hexData: {
    근력: 1,
    심폐지구력: 1,
    유연성: 2,
    순발력: 2,
    민첩성: 3,
    근지구력: 4,
  },
  gradeInfo: {
    grade: 'A',
    description: 'Excellent performance',
  },
  date: '2025-11-17',
};
