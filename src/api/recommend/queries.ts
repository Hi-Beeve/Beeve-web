import { useQuery } from "@tanstack/react-query";
import { recommendApi } from "./recommend.api";

export const recommendQueryKeys = {
    all: ['recommend'] as const,
    byDate: (date?: string) => ['recommend', date] as const,
}

export const useRecommendQuery = (date?: string) => {
    return useQuery({
        queryKey: recommendQueryKeys.byDate(date),
        queryFn: () => recommendApi(date),
    });
}
