/**
 * Apple Sign In OAuth 관련 유틸리티 함수들
 */

/**
 * Apple 로그인 URL 생성 (response_mode=form_post)
 */
export const getAppleLoginUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Apple 로그인 설정이 누락되었습니다.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'form_post',
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
};

/**
 * Apple id_token payload를 base64 디코딩하여 sub, email 추출
 */
export const parseAppleIdToken = (idToken: string): { sub: string; email?: string } => {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('유효하지 않은 Apple id_token 형식입니다.');
  }

  // base64url → base64 변환 후 디코딩
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const decoded = Buffer.from(payload, 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded);

  if (!parsed.sub) {
    throw new Error('Apple id_token에 sub가 없습니다.');
  }

  return {
    sub: parsed.sub as string,
    email: parsed.email as string | undefined,
  };
};
