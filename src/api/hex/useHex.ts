import { useHexWithDateQuery, usePostTestDataMutation } from '@/api/hex/queries';
import { HexWithDateRequest, HexData, HexWithDateResponse, TestDataRequest } from '@/types/hex';

// 클라이언트에서 사용하는 hex 데이터 훅
export const useHex = (params: HexWithDateRequest = {}) => {
  const query = useHexWithDateQuery(params);


  const transformedData = query.data?.data ? {
    ...query.data.data,
  } : undefined;

  return {
    ...query,
    data: transformedData,
  };
};

export const usePostTestData = () => {
  const mutation = usePostTestDataMutation();
  return mutation;
};
  