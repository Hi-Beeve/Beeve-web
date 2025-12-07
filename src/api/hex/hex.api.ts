import instance from '@/api/instance';
import { HexWithDateRequest, HexWithDateResponse, TestDataRequest } from '@/types/hex';

export const hexWithDateApi = async (params: HexWithDateRequest): Promise<HexWithDateResponse> => {
  const response = await instance.get<HexWithDateResponse>('/fitness', {
    params: {
      measureDay: params.date,
    },
  });
  return response.data;
};
export const getHexDateListApi = async (): Promise<string[]> => {
  // 실제 서버 연동 시 아래 주석 해제
  const response = await instance.get<{ measureDates: string[] }>('/fitness/measure-days');
  return response.data?.measureDates || [];
};

export const postTestDataApi = async (params: TestDataRequest) => {
  const response = await instance.post<HexWithDateResponse>('/fitness', params);
  return response;

}; 
