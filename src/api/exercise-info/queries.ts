import { useMutation, useQuery } from "@tanstack/react-query";
import { getExerciseInfoApi, postExerciseInfoApi } from "./exerciseInfo.api";

export const exerciseInfoQueryKeys = {
  all: ['exerciseInfo'] as const,
};

export const useGetExerciseInfoQuery = () => {
  return useQuery({
    queryKey: exerciseInfoQueryKeys.all,
    queryFn: getExerciseInfoApi,
    retry: false,
  });
};

export const usePostExerciseInfoMutation = () => {
  return useMutation({
    mutationFn: postExerciseInfoApi,
  });
};
