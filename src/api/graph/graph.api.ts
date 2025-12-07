import instance from "../instance";

export const getGraphData = async () => {
    const response = await instance.get('/fitness/grade');
    return response.data;
}