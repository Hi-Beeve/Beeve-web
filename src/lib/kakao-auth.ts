/**
 * 카카오 OAuth 2.0 인증 관련 유틸리티 함수들
 */

export interface KakaoUser {
  id: number;
  properties?: {
    nickname?: string;
    profile_image?: string;
  };
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

/**
 * 카카오 로그인 URL 생성
 */
export const getKakaoLoginUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('카카오 로그인 설정이 누락되었습니다.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

/**
 * 인증 코드로 카카오 액세스 토큰 요청
 */
export const getKakaoAccessToken = async (code: string) => {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('카카오 로그인 설정이 누락되었습니다.');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('카카오 액세스 토큰 요청에 실패했습니다.');
  }

  return response.json();
};

/**
 * 액세스 토큰으로 카카오 사용자 정보 요청
 */
export const getKakaoUserInfo = async (accessToken: string) => {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error('카카오 사용자 정보 요청에 실패했습니다.');
  }

  return response.json();
};
