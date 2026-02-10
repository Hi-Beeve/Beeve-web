export type AuthLoginRequest = {
    provider: string;
    providerUserId: string;
}

export type AuthResponse = {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
    expiresIn: number;
    scope: string;
    refreshTokenExpiresIn: number;
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
    weight:number,
    phoneNumber: string,
    verificationToken: string
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
  phoneNumber: string;
  verificationToken: string;
}