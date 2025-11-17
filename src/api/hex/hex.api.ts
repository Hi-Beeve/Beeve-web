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
    심폐지구력: 2,
    유연성: 3,
    순발력: 1,
    민첩성: 2,
    근지구력: 4,
  },
  gradeInfo: {
    grade: 'A',
    description: 'Excellent performance',
  },
  date: '2023-10-01',
};
