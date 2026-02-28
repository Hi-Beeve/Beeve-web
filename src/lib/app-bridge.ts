/**
 * Flutter WebView ↔ WebApp 통신 브릿지 타입 정의
 * Flutter에서 window.AppBridge.onLoginSuccess() 를 호출해 로그인 완료를 알립니다.
 */

export interface NativeLoginData {
  accessToken: string;
  refreshToken: string;
  name: string;
  profileUrl: string;
  providerUserId: string;
  email?: string;
}

declare global {
  interface Window {
    AppBridge?: {
      onLoginSuccess: (data: NativeLoginData) => void;
      onLogout: () => void;
    };
  }
}

export {};
