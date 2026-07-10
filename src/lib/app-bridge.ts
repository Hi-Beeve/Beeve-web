/**
 * Flutter WebView ↔ WebApp 통신 브릿지
 *
 * [앱 → 웹]  window.AppBridge.onLoginSuccess(data)  — 로그인/자동로그인
 *            window.AppBridge.onLogout()             — 앱이 로그아웃 요청
 *
 * [웹 → 앱]  window.FlutterBridge.postMessage(...)  — 웹 로그아웃 알림
 *            Flutter 팀: JavascriptChannel(name: 'FlutterBridge') 설정 필요
 */

export interface NativeLoginData {
  accessToken: string;
  refreshToken: string;
  name: string;
  profileUrl?: string;
  providerUserId: string;
  email?: string;
  provider: 'kakao' | 'google' | 'apple';
}

// ─── 타이밍 이슈 대응: 큐 패턴 ───────────────────────────────────────────────
// React 마운트(useEffect) 전에 Flutter가 AppBridge를 호출할 수 있음.
// 핸들러가 등록되기 전에 도착한 이벤트를 큐에 보관했다가, 등록 시점에 일괄 처리.

type BridgeEvent =
  | { type: 'login'; data: NativeLoginData }
  | { type: 'logout' };

const _queue: BridgeEvent[] = [];
let _loginHandler: ((data: NativeLoginData) => void) | null = null;
let _logoutHandler: (() => void) | null = null;

// 모듈 로드 즉시 등록 — React 마운트 전에도 호출 가능
if (typeof window !== 'undefined') {
  window.AppBridge = {
    onLoginSuccess: (data: NativeLoginData) => {
      if (_loginHandler) {
        _loginHandler(data);
      } else {
        console.log('[AppBridge] onLoginSuccess 큐에 저장 (React 미준비)');
        _queue.push({ type: 'login', data });
      }
    },
    onLogout: () => {
      if (_logoutHandler) {
        _logoutHandler();
      } else {
        console.log('[AppBridge] onLogout 큐에 저장 (React 미준비)');
        _queue.push({ type: 'logout' });
      }
    },
  };
}

/** React 마운트 후 실제 핸들러 등록 + 큐 소진 */
export function registerBridgeHandlers(
  onLogin: (data: NativeLoginData) => void,
  onLogout: () => void
): void {
  _loginHandler = onLogin;
  _logoutHandler = onLogout;

  // 큐에 쌓인 이벤트 순서대로 처리
  const queued = _queue.splice(0);
  queued.forEach((event) => {
    if (event.type === 'login') onLogin(event.data);
    else onLogout();
  });
}

/** React 언마운트 시 핸들러 해제 */
export function unregisterBridgeHandlers(): void {
  _loginHandler = null;
  _logoutHandler = null;
}

// ─── 웹 → 앱: 로그아웃 알림 ─────────────────────────────────────────────────
// Flutter 팀 설정 필요:
//   webview_flutter: JavascriptChannel(name: 'FlutterBridge', onMessageReceived: (msg) { ... })
//   flutter_inappwebview: addJavaScriptHandler(handlerName: 'onWebLogout', ...)

export function notifyNativeLogout(): void {
  if (typeof window === 'undefined') return;

  if (window.FlutterBridge) {
    window.FlutterBridge.postMessage(JSON.stringify({ type: 'logout' }));
    console.log('[AppBridge] 웹 로그아웃 → 앱 전달 완료');
  } else {
    console.log('[AppBridge] FlutterBridge 없음 (브라우저 환경)');
  }
}

// ─── 전역 타입 선언 ──────────────────────────────────────────────────────────

declare global {
  interface Window {
    /** 앱 → 웹 */
    AppBridge?: {
      onLoginSuccess: (data: NativeLoginData) => void;
      onLogout: () => void;
    };
    /** 웹 → 앱 (Flutter JavascriptChannel 'FlutterBridge') */
    FlutterBridge?: {
      postMessage: (message: string) => void;
    };
  }
}

export {};
