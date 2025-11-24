import { useLoginQuery, useSignUpQuery, useRefreshTokenQuery } from './queries';
import { AuthLoginRequest, AuthSignUpRequest, ClientAdditionalInfo, ClientOAuthInfo } from '@/types/auth';

// 통합 소셜 로그인 커스텀 훅
export const useSocialLogin = () => {
  const mutation = useLoginQuery();

  const socialLogin = (clientUserInfo: ClientOAuthInfo) => {
    // 클라이언트 데이터를 서버 API 형식으로 정제
    const serverData: AuthLoginRequest = {
      provider: clientUserInfo.provider,
      providerUserId: clientUserInfo.id
    };

    return mutation.mutate(serverData);
  };

  return {
    socialLogin,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
};

// 회원가입 커스텀 훅
export const useSignUp = () => {
  const mutation = useSignUpQuery();

  const signUp = (clientUserInfo: ClientOAuthInfo, additionalInfo: ClientAdditionalInfo) => {
    // 클라이언트 데이터를 서버 API 형식으로 정제
    const serverData: AuthSignUpRequest = {
      provider: clientUserInfo.provider,
      providerUserId: clientUserInfo.id,
      name: clientUserInfo.nickname,
      email: clientUserInfo.email || '',
      profileUrl: clientUserInfo.profileImage || '',
      gender: additionalInfo.gender,
      birthDate: additionalInfo.birthDate,
      height: additionalInfo.height,
      weight: additionalInfo.weight
    };

    return mutation.mutate(serverData);
  };

  return {
    signUp,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
};

// 토큰 갱신 커스텀 훅
export const useRefreshToken = () => {
  const mutation = useRefreshTokenQuery();
    // localStorage에 저장한 
  const refreshToken = (clientRefreshToken: string) => {
    // 클라이언트 데이터를 서버 API 형식으로 정제
    const serverData = {
      refreshToken: clientRefreshToken
    };

    return mutation.mutate(serverData);
  };

  return {
    refreshToken,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
};

// 사용 예시:
// const { socialLogin, isLoading, data, error } = useSocialLogin();
// const { signUp, isLoading, data, error } = useSignUp();
// const { refreshToken, isLoading, data, error } = useRefreshToken();