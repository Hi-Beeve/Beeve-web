import { useQuery } from "@tanstack/react-query";
import { getRankApi } from "./rank.api";

export const rankQueryKeys = {
    all: ['rank'] as const,
}

export const useRankQuery = () => {
    return useQuery({
        queryKey: rankQueryKeys.all,
        queryFn: getRankApi,
    });
}
