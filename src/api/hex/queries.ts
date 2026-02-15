import { useMutation, useQuery } from '@tanstack/react-query';
import { getHexDateListApi, hexWithDateApi, postTestDataApi } from './hex.api';
import { HexWithDateRequest } from '@/types/hex';

export const hexQueryKeys = {
  all: ['hex'] as const,
  withDate: (params: HexWithDateRequest) => ['hex', 'withDate', params] as const,
  postTestData: () => ['hex', 'postTestData'] as const,
};

export const useHexWithDateQuery = (params: HexWithDateRequest, options?: { noCache?: boolean }) => {
  return useQuery({
    queryKey: hexQueryKeys.withDate(params),
    queryFn: () => hexWithDateApi(params),
    enabled: !!params.date,
    ...(options?.noCache && { staleTime: 0, gcTime: 0 }),
  });
};

export const useHexDateListQuery = () => {
  return useQuery({
    queryKey: ['hex', 'dateList'],
    queryFn: getHexDateListApi,
  });
};

export const usePostTestDataMutation = () => {
  return useMutation({
    mutationKey: hexQueryKeys.postTestData(),
    mutationFn: postTestDataApi,
  });
};
