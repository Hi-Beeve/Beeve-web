import { useHexWithDateQuery } from '@/api/hex/queries';
import { HexWithDateRequest, HexData } from '@/types/hex';

// 서버 데이터를 클라이언트에서 사용할 형식으로 변환
export const transformHexData = (serverHexData: HexData): number[] => {
  return [
    serverHexData.근력,
    serverHexData.심폐지구력,
    serverHexData.유연성,
    serverHexData.순발력,
    serverHexData.민첩성,
    serverHexData.근지구력,
  ];
};

// 클라이언트에서 사용하는 hex 데이터 훅
export const useHex = (params: HexWithDateRequest = {}) => {
  const query = useHexWithDateQuery(params);

  const transformedData = query.data ? {
    ...query.data,
    hexDataArray: transformHexData(query.data.hexData),
  } : undefined;

  return {
    ...query,
    data: transformedData,
  };
};
