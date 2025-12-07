import instance from "../instance";

export const getRankApi = async () => {
    const response = await instance.get('/rank/list');
    return response.data;
}