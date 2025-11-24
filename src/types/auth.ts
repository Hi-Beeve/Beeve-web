export type AuthLoginRequest = {
    provider: string;
    providerUserId: string;
}

export type AuthResponse = {
    isSuccess: boolean;
    code: string;
    data: {
        accessToken: string;
        refreshToken: string;
        name: string;
        profileUrl: string;
    }
}

export type AuthSignUpRequest = {
    provider: string,
    providerUserId: string,
    name: string,
    email: string,
    profileUrl: string,
    gender: string,
    birthDate: string,
    height: number,
    weight:number
}

// 클라이언트 OAuth 사용자 정보 타입
export type ClientOAuthInfo = {
  id: string;
  nickname: string;
  email?: string;
  profileImage?: string;
  provider: 'kakao' | 'google';
}