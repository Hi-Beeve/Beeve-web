import { useRankQuery } from "./queries";

export const getRankApi= () => {
    const query = useRankQuery();
    return query.data;
}
