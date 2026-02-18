import { AuthLoginRequest, AuthSignUpRequest, AuthResponse } from "@/types/auth";
import instance from "../instance";
import { ERROR_CODES } from "@/constants/errorCodes";

// 통합 소셜 인증 API - 로그인 시도 후 회원 상태 확인
export const socialAuthApi = async (params: AuthLoginRequest): Promise<{
  authData?: AuthResponse;
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
    if (error.response?.data?.code === ERROR_CODES.AUTH_USER_NOT_FOUND || error.response?.data?.code === ERROR_CODES.MEMBER_NOT_FOUND) {
      return {
        needsSignUp: true
      };
    }
    // 다른 에러의 경우 재throw
    throw error;
  }
};

// 회원가입 API - 성공 시 바로 로그인 토큰 반환
export const signUpApi = async (params: AuthSignUpRequest): Promise<AuthResponse> => {
  const response = await instance.post('/auth/signup', params);
  return response.data.data;
};

// 휴대폰 인증번호 발송
export const sendPhoneCode = async (phoneNumber: string) => {
  const response = await instance.post('/auth/phone/send-code', { phoneNumber });
  return response.data;
};

// 휴대폰 인증번호 확인
export const verifyPhoneCode = async (phoneNumber: string, code: string) => {
  const response = await instance.post('/auth/phone/verify-code', { phoneNumber, code });
  return response.data;
};

// 토큰 재발급
export const refreshTokenApi = async ({refreshToken}: {refreshToken: string}) => {
    const response = await instance.post('/auth/refresh', {refreshToken});
    return response.data;
};

// 로그아웃 
export const logoutApi = async () => {
    const response = await instance.post('/auth/logout');
    return response.data;
};
