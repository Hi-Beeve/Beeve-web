import { useMutation, useQuery } from "@tanstack/react-query";
import { getProfileApi, updateProfileApi } from "./mypage.api";

export const mypageQueryKeys = {
  all: ['mypage'] as const,
};

export const useProfileQuery = () => {
  return useQuery({
    queryKey: mypageQueryKeys.all,
    queryFn: getProfileApi,
  });
};

export const useUpdateProfileQuery = () => {
  return useMutation({
    mutationFn: updateProfileApi,
  });
};