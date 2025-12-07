import { useRecommendMutation } from "./queries";
import { RecommendRequestData, RecommendResponseData } from "@/types/recommned";
import { useAuth } from "@/contexts/auth-context";
import { useCallback } from "react";

interface UseRecommendParams {
  contraindications?: string;
  measurePlace?: string;
}

export const useRecommend = () => {
  const { user } = useAuth();
  const mutation = useRecommendMutation();

  const getRecommendation = useCallback(async (params: UseRecommendParams): Promise<RecommendResponseData> => {
    if (!user) {
      throw new Error('사용자 정보가 없습니다.');
    }

    // 요청 데이터 생성
    const requestData: RecommendRequestData = {
      gender: user.gender || 'M', // 기본값 M
      age: user.birthDate ? calculateAge(user.birthDate) : 25, // 기본값 25
      contraindications: params.contraindications || "",
      measurePlace: params.measurePlace || "HOME",
      purpose: 'GENERAL_FITNESS' // 고정값
    };

    // API 호출
    const response = await mutation.mutateAsync(requestData);
    return response.data as RecommendResponseData;
  }, [user?.id, user?.gender, user?.birthDate, mutation.mutateAsync]); // 필요한 값들만 의존성으로 추가

  return {
    getRecommendation,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data?.data as RecommendResponseData | undefined,
  };
};

// 생년월일로부터 나이 계산하는 헬퍼 함수
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};