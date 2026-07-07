import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileApi, updateProfileApi, updateAiConsentApi, withdrawMemberApi } from "./mypage.api";

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

export const useAiConsentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAiConsentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mypageQueryKeys.all });
    },
  });
};

export const useWithdrawMutation = () => {
  return useMutation({
    mutationFn: withdrawMemberApi,
  });
};