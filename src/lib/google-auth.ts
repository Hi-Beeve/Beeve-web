/**
 * 구글 OAuth 2.0 인증 관련 유틸리티 함수들
 */

// 구글 사용자 정보 인터페이스
export interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

// 구글 토큰 응답 인터페이스
export interface GoogleAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

/**
 * 구글 로그인 URL 생성
 */
export const getGoogleLoginUrl = (): string => {
  const clientId = process.env.NEXT_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_GOOGLE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('구글 로그인 설정이 누락되었습니다.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * 인증 코드로 액세스 토큰 요청 (서버 API 라우트 사용)
 */
export const getGoogleAccessToken = async (code: string): Promise<GoogleAuthResponse> => {
  const response = await fetch('/api/auth/google/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '구글 토큰 요청 실패');
  }

  return response.json();
};

/**
 * 액세스 토큰으로 사용자 정보 요청
 */
export const getGoogleUserInfo = async (accessToken: string): Promise<GoogleUser> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`구글 사용자 정보 요청 실패: ${error}`);
  }

  return response.json();
};

/**
 * 구글 로그아웃 (토큰 무효화)
 */
export const googleLogout = async (accessToken: string): Promise<void> => {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  } catch (error) {
    console.error('구글 로그아웃 실패:', error);
    // 로그아웃 실패해도 로컬 세션은 정리
  }
};

/**
 * 구글 계정 연결 해제
 */
export const googleUnlink = async (accessToken: string): Promise<void> => {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  } catch (error) {
    console.error('구글 연결 해제 실패:', error);
    throw error;
  }
};
