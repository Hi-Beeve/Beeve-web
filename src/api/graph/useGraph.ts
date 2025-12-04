import { useGraphQuery } from "./queries";

export const getGraphData= () => {
    const query = useGraphQuery();
    return query.data;
}
