import { useRecommendQuery } from "./queries";
import { RecommendResponseData } from "@/types/recommned";

export const useRecommend = () => {
  const query = useRecommendQuery();

  const recommendation: RecommendResponseData | undefined = query.data?.isSuccess
    ? query.data.data
    : undefined;

  return {
    isLoading: query.isLoading,
    error: query.error,
    isSuccess: query.isSuccess && query.data?.isSuccess,
    data: recommendation,
    errorMessage: query.data?.isSuccess === false ? query.data.message : null,
    refetch: query.refetch,
  };
};
