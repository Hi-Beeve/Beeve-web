import instance from '@/api/instance';
import { HexWithDateRequest, HexWithDateResponse, TestDataRequest } from '@/types/hex';

export const hexWithDateApi = async (params: HexWithDateRequest): Promise<{data: HexWithDateResponse | null}> => {
  console.log('📡 hexWithDateApi 호출 - params:', params);
  try {
    const response = await instance.get('/fitness', {
      params: {
        measureDay: params.date,
      },
    });
    console.log('📡 hexWithDateApi 응답:', response.status, response.data);
    const innerData = response.data?.data ?? response.data;
    return { data: innerData ?? null };
  } catch (error) {
    console.error('📡 hexWithDateApi 에러:', error);
    throw error;
  }
};

export const getHexDateListApi = async (): Promise<string[]> => {
  const response = await instance.get('/fitness/measure-days');
  const payload = response.data?.data ?? response.data;
  const dates = payload?.measureDates;
  return Array.isArray(dates) ? dates : [];
};

export const postTestDataApi = async (params: TestDataRequest) => {
  const response = await instance.post<HexWithDateResponse>('/fitness', params);
  return response;
};
