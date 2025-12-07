import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '인증 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: '구글 로그인 설정이 누락되었습니다.' },
        { status: 500 }
      );
    }

    // 구글에 토큰 요청
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return NextResponse.json(
        { error: `구글 토큰 요청 실패: ${error}` },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    return NextResponse.json(tokenData);

  } catch (error) {
    console.error('구글 토큰 교환 실패:', error);
    return NextResponse.json(
      { error: '토큰 교환 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
