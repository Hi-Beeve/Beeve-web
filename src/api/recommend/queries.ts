import { useQuery } from "@tanstack/react-query";
import { recommendApi } from "./recommend.api";

export const recommendQueryKeys = {
    all: ['recommend'] as const,
}

export const useRecommendQuery = () => {
    return useQuery({
        queryKey: recommendQueryKeys.all,
        queryFn: () => recommendApi(),
    });
}
