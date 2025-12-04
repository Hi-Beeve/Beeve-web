import instance from "../instance";

export const getRankApi = async () => {
    const response = await instance.get('/fitness/rank');
    return response.data;
}