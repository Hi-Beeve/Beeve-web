import instance from "../instance";

export const recommendApi = async (date?: string) => {
    const params = date ? { measureDay: date } : {};
    const response = await instance.get('/fitness/recommend', { params });
    return response.data;
}
