import { AuthLoginRequest, AuthSignUpRequest, AuthResponse } from "@/types/auth";
import instance from "../instance";

// 통합 소셜 인증 API - 로그인 시도 후 회원 상태 확인
export const useSocialAuthApi = async (params: AuthLoginRequest): Promise<{
  authData?: AuthResponse['data'];
  needsSignUp?: boolean;
}> => {
  try {
    const response = await instance.post('/auth/login', params);
    return {
      authData: response.data.data,
      needsSignUp: false
    };
  } catch (error: any) {
    // 회원이 존재하지 않는 경우
    if (error.response?.data?.code === 'AUTH101' || error.response?.data?.code === 'MEMBER201') {
      return {
        needsSignUp: true
      };
    }
    // 다른 에러의 경우 재throw
    throw error;
  }
};

// 회원가입 API - 성공 시 바로 로그인 토큰 반환
export const useSignUpApi = async (params: AuthSignUpRequest): Promise<AuthResponse> => {
  const response = await instance.post('/auth/signup', params);
  return response.data;
};

// 토큰 재발급 
export const useRefreshTokenApi = async ({refreshToken}: {refreshToken: string}) => {
    const response = await instance.post('/auth/refresh', {refreshToken});
    return response.data;
};