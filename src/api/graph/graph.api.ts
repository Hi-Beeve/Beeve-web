import instance from "../instance";

export const getGraphData = async () => {
    const response = await instance.get('/rank/grade-list');
    return response.data;
}