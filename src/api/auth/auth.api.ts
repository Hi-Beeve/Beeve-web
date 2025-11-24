import { AuthLoginRequest, AuthSignUpRequest, AuthResponse } from "@/types/auth";
import instance from "../instance";

// 🚧 현재 목 데이터 모드로 실행 중 (서버 없이 테스트)
// 실제 서버 연동 시 각 함수의 주석 처리된 코드로 교체하세요

// 통합 소셜 인증 API - 로그인 시도 후 회원 상태 확인
export const useSocialAuthApi = async (params: AuthLoginRequest): Promise<{
  authData?: AuthResponse['data'];
  needsSignUp?: boolean;
}> => {
  // TODO : 임시: 서버 없이 테스트하기 위한 목 데이터
  console.log('🔄 소셜 로그인 API 호출 (목 데이터):', params);
  
  // 1초 지연으로 실제 API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 모든 사용자를 신규 회원으로 처리 (회원가입 플로우 테스트)
  return {
    needsSignUp: true
  };
  
  /* 실제 서버 연동 시 사용할 코드
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
  */
};

// 회원가입 API - 성공 시 바로 로그인 토큰 반환
export const useSignUpApi = async (params: AuthSignUpRequest): Promise<AuthResponse> => {
  // 임시: 서버 없이 테스트하기 위한 목 데이터
  console.log('🔄 회원가입 API 호출 (목 데이터):', params);
  
  // 2초 지연으로 실제 API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 성공적인 회원가입 응답 시뮬레이션
  return {
    isSuccess: true,
    code: 'SUCCESS',
    data: {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      name: params.name,
      profileUrl: params.profileUrl
    }
  };
  
  /* 실제 서버 연동 시 사용할 코드
  const response = await instance.post('/auth/signup', params);
  return response.data;
  */
};

// 토큰 재발급 
export const useRefreshTokenApi = async ({refreshToken}: {refreshToken: string}) => {
  // 임시: 서버 없이 테스트하기 위한 목 데이터
  console.log('🔄 토큰 재발급 API 호출 (목 데이터):', refreshToken);
  
  // 1초 지연으로 실제 API 호출 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 새로운 토큰 반환 시뮬레이션
  return {
    isSuccess: true,
    code: 'SUCCESS',
    data: {
      accessToken: `mock_new_access_token_${Date.now()}`,
      refreshToken: `mock_new_refresh_token_${Date.now()}`
    }
  };
  
  /* 실제 서버 연동 시 사용할 코드
  const response = await instance.post('/auth/refresh', {refreshToken});
  return response.data;
  */
};