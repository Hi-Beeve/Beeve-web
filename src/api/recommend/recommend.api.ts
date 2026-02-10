import instance from "../instance";

export const recommendApi = async () => {
    const response = await instance.get('/fitness/recommend');
    return response.data;
}
