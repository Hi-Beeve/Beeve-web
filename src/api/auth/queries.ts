import { useMutation } from "@tanstack/react-query";
import { socialAuthApi, signUpApi, refreshTokenApi } from "./auth.api";
import { AuthLoginRequest, AuthSignUpRequest } from "@/types/auth";

export const authQueryKeys = {
    login: () => ['auth', 'login'] as const,
    refresh: () => ['auth', 'refresh'] as const,
    signUp: () => ['auth', 'signUp'] as const,
};

export const useLoginQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.login(),
        mutationFn: (params: AuthLoginRequest) => socialAuthApi(params),
        onSuccess: (data) => {
            // 로그인 성공 시 토큰을 localStorage에 저장
            console.log('🔍 Login response data:', data);
            if (data.authData?.access_token) {
                localStorage.setItem('authToken', data.authData.access_token);
                console.log('✅ Access token saved to localStorage as "authToken"');
            }
            if (data.authData?.refresh_token) {
                localStorage.setItem('refreshToken', data.authData.refresh_token);
                console.log('✅ Refresh token saved to localStorage as "refreshToken"');
            }
            
            // 기존 쿠키 제거 (있다면)
            document.cookie = 'beeve_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'beeve_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('🧹 Cleared old cookies (beeve_auth, beeve_token)');
            
            console.log('✅ Login successful, tokens saved to localStorage');
        },
        onError: (error) => {
            console.error('❌ Login failed:', error);
        }
    });
};

export const useSignUpQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.signUp(),
        mutationFn: (params: AuthSignUpRequest) => signUpApi(params),
        onSuccess: (data) => {
            // 회원가입 성공 시 토큰을 localStorage에 저장
            console.log('🔍 SignUp response data:', data);
            if (data.access_token) {
                localStorage.setItem('authToken', data.access_token);
                console.log('✅ Access token saved to localStorage as "authToken"');
            }
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
                console.log('✅ Refresh token saved to localStorage as "refreshToken"');
            }
            
            // 기존 쿠키 제거 (있다면)
            document.cookie = 'beeve_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'beeve_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('🧹 Cleared old cookies (beeve_auth, beeve_token)');
            
            console.log('✅ SignUp successful, tokens saved to localStorage');
        },
        onError: (error) => {
            console.error('❌ SignUp failed:', error);
        }
    });
};

export const useRefreshTokenQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.refresh(),
        mutationFn: (params: {refreshToken: string}) => refreshTokenApi(params),
        onSuccess: (data) => {
            // 토큰 갱신 성공 시 새로운 토큰을 localStorage에 저장
            if (data.access_token) {
                localStorage.setItem('authToken', data.access_token);
            }
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }
            console.log('✅ Token refresh successful, new tokens saved to localStorage');
        },
        onError: (error) => {
            console.error('❌ Token refresh failed:', error);
            // 토큰 갱신 실패 시 기존 토큰 제거하고 로그인 페이지로 리다이렉트
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
        }
    });
};





