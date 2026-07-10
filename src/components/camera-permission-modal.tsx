'use client';

import { useState } from 'react';

interface CameraPermissionModalProps {
  isOpen: boolean;
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  exerciseTitle: string;
}

export function CameraPermissionModal({
  isOpen,
  onPermissionGranted,
  onPermissionDenied,
  exerciseTitle
}: CameraPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  const requestCameraPermission = async () => {
    setIsRequesting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      stream.getTracks().forEach(track => track.stop());
      onPermissionGranted();
    } catch (err) {
      console.error('카메라 권한 요청 실패:', err);
      setIsDenied(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const openSettings = () => {
    // Flutter 앱이 NavigationDelegate에서 app-settings: URL을 가로채 iOS 설정 앱을 열고
    // WebView 자체는 이동 없이 그대로 유지함 (앱팀 확인)
    window.location.href = 'app-settings:';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          {isDenied ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">카메라 접근이 거부되었습니다</h2>
              <p className="text-gray-600 mb-6">
                측정을 이용하려면 설정에서 카메라 권한을 허용해 주세요.
              </p>
              <div className="space-y-3">
                <button
                  onClick={openSettings}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  설정에서 허용하기
                </button>
                <button
                  onClick={onPermissionDenied}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  닫기
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">카메라 권한이 필요합니다</h2>
              <p className="text-gray-600 mb-6">
                <strong>{exerciseTitle}</strong> 측정을 위해 카메라 접근 권한이 필요합니다.
              </p>
              <div className="space-y-3">
                <button
                  onClick={requestCameraPermission}
                  disabled={isRequesting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {isRequesting ? '권한 요청 중...' : '계속하기'}
                </button>
              </div>
            </>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>카메라는 측정 목적으로만 사용되며, 영상이 외부로 전송되지 않습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
