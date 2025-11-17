import { useQuery } from '@tanstack/react-query';
import { hexWithDateApi } from './hex.api';
import { HexWithDateRequest } from '@/types/hex';

export const hexQueryKeys = {
  all: ['hex'] as const,
  withDate: (params: HexWithDateRequest) => ['hex', 'withDate', params] as const,
};

export const useHexWithDateQuery = (params: HexWithDateRequest) => {
  return useQuery({
    queryKey: hexQueryKeys.withDate(params),
    queryFn: () => hexWithDateApi(params),
  });
};
