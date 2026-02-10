/**
 * 카카오 OAuth 2.0 인증 관련 유틸리티 함수들
 */

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
