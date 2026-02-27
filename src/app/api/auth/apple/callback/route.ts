import { NextRequest, NextResponse } from 'next/server';
import { parseAppleIdToken } from '@/lib/apple-auth';

/**
 * Apple Sign In form_post 콜백 핸들러
 * Apple은 GET redirect 대신 POST form_post 방식으로 콜백을 보냅니다.
 * 이 핸들러에서 id_token을 파싱한 뒤 클라이언트 콜백 페이지로 GET redirect합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const idToken = formData.get('id_token') as string | null;
    const error = formData.get('error') as string | null;
    const userJson = formData.get('user') as string | null;

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=apple_${error}`, request.url),
        302
      );
    }

    if (!idToken) {
      return NextResponse.redirect(
        new URL('/auth/login?error=no_id_token', request.url),
        302
      );
    }

    // id_token payload 파싱 → sub, email 추출
    const { sub, email } = parseAppleIdToken(idToken);

    // 첫 로그인 시에만 user JSON이 제공됨
    let name: string | undefined;
    if (userJson) {
      try {
        const userObj = JSON.parse(userJson);
        const firstName = userObj?.name?.firstName || '';
        const lastName = userObj?.name?.lastName || '';
        name = [firstName, lastName].filter(Boolean).join(' ') || undefined;
      } catch {
        // user JSON 파싱 실패는 무시
      }
    }

    // 클라이언트 콜백 페이지로 GET redirect
    // 302를 명시해야 브라우저가 POST → GET으로 전환함 (기본값 307은 POST 유지 → 405 발생)
    const redirectParams = new URLSearchParams({ sub });
    if (email) redirectParams.set('email', email);
    if (name) redirectParams.set('name', name);

    return NextResponse.redirect(
      new URL(`/auth/apple/callback?${redirectParams.toString()}`, request.url),
      302
    );
  } catch (err) {
    console.error('Apple callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/login?error=apple_callback_failed', request.url),
      302
    );
  }
}
