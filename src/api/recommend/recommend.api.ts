import instance from "../instance";

// 저장된 추천 조회 (GET)
export const getRecommendApi = async (date?: string) => {
    const params = date ? { measureDay: date } : {};
    const response = await instance.get('/fitness/recommend', { params });
    return response.data;
}

// AI 호출해서 새 추천 생성 (POST)
export const createRecommendApi = async (date?: string) => {
    const params = date ? { measureDay: date } : {};
    const response = await instance.post('/fitness/recommend', {}, { params });
    return response.data;
}
