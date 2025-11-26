import { useHexWithDateQuery } from '@/api/hex/queries';
import { HexWithDateRequest, HexData, HexWithDateResponse } from '@/types/hex';

// 클라이언트에서 사용하는 hex 데이터 훅
export const useHex = (params: HexWithDateRequest = {}) => {
  const query = useHexWithDateQuery(params);


  const transformedData = query.data ? {
    ...query.data,
    // hexDataArray: transformHexData(query.data.hexData),
  } : undefined;

  return {
    ...query,
    data: transformedData,
  };
};
