import { useQuery } from "@tanstack/react-query";
import { getRecommendApi } from "./recommend.api";

export const recommendQueryKeys = {
    all: ['recommend'] as const,
    byDate: (date?: string) => ['recommend', date] as const,
}

export const useRecommendQuery = (date?: string) => {
    return useQuery({
        queryKey: recommendQueryKeys.byDate(date),
        queryFn: () => getRecommendApi(date),
    });
}
