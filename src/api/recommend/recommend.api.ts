import { RecommendRequestData } from "@/types/recommned";
import instance from "../instance";

export const recommendApi = async (params: RecommendRequestData) => {
    const response = await instance.post('/recommend',params);
    return response.data;
}