export type AuthLoginRequest = {
    provider: string;
    providerUserId: string;
}

export type AuthResponse = {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    refresh_token_expires_in: number;
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

// 클라이언트 추가 정보 타입
export type ClientAdditionalInfo = {
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
}