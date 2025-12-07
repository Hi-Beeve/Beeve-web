import { useMutation } from "@tanstack/react-query";
import { recommendApi } from "./recommend.api";
import { RecommendRequestData } from "@/types/recommned";

export const recommendQueryKeys = {
    all: ['recommend'] as const,
}

export const useRecommendMutation = () => {
    return useMutation({
        mutationKey: recommendQueryKeys.all,
        mutationFn: (params:RecommendRequestData)=>recommendApi(params),
    });
}
