import { useQuery } from "@tanstack/react-query";
import { getGraphData } from "./graph.api";

export const graphQueryKeys = {
    all: ['graph'] as const,
}

export const useGraphQuery = () => {
    return useQuery({
        queryKey: graphQueryKeys.all,
        queryFn: getGraphData,
    });
}
