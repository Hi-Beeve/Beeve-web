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
        onSuccess: (data: any) => {
            // 로그인 성공 시 토큰을 localStorage에 저장
            console.log('🔍 Login response data:', data);
            console.log('🔍 Login response data.authData:', data.authData);
            console.log('🔍 Full authData structure:', JSON.stringify(data.authData, null, 2));
            
            console.log("data ::::: ", data)
            if (data.authData?.accessToken) {
                localStorage.setItem('authToken', data.authData.accessToken);
                console.log('✅ Access token saved to localStorage:', data.authData.accessToken.substring(0, 20) + '...');
                
                // 저장 확인
                const saved = localStorage.getItem('authToken');
                console.log('🔍 Verification - authToken in localStorage:', saved ? 'EXISTS' : 'NOT FOUND');
            } else {
                console.log('⚠️ No accessToken in response data');
            }
            
            if (data.authData?.refreshToken) {
                localStorage.setItem('refreshToken', data.authData.refreshToken);
                console.log('✅ Refresh token saved to localStorage:', data.authData.refreshToken.substring(0, 20) + '...');
                
                // 저장 확인
                const saved = localStorage.getItem('refreshToken');
                console.log('🔍 Verification - refreshToken in localStorage:', saved ? 'EXISTS' : 'NOT FOUND');
            } else {
                console.log('⚠️ No refreshToken in response data');
            }
            
            // 기존 쿠키 제거 (있다면)
            document.cookie = 'beeve_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'beeve_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('🧹 Cleared old cookies (beeve_auth, beeve_token)');
            
            // localStorage 전체 상태 확인
            console.log('📦 Current localStorage keys:', Object.keys(localStorage));
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
        onSuccess: (data: any) => {
            // 회원가입 성공 시 토큰을 localStorage에 저장
            console.log('🔍 SignUp response data:', data);
            
            if (data.accessToken) {
                localStorage.setItem('authToken', data.accessToken);
                console.log('✅ Access token saved to localStorage:', data.accessToken.substring(0, 20) + '...');
                
                // 저장 확인
                const saved = localStorage.getItem('authToken');
                console.log('🔍 Verification - authToken in localStorage:', saved ? 'EXISTS' : 'NOT FOUND');
            } else {
                console.log('⚠️ No accessToken in signup response data');
            }
            
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
                console.log('✅ Refresh token saved to localStorage:', data.refreshToken.substring(0, 20) + '...');
                
                // 저장 확인
                const saved = localStorage.getItem('refreshToken');
                console.log('🔍 Verification - refreshToken in localStorage:', saved ? 'EXISTS' : 'NOT FOUND');
            } else {
                console.log('⚠️ No refreshToken in signup response data');
            }
            
            // 회원가입 시 사용자 정보도 저장 (pendingUserInfo에서 가져와서 AuthContext 형식으로 저장)
            const pendingUserInfo = localStorage.getItem('pendingUserInfo');
            if (pendingUserInfo) {
                try {
                    const userInfo = JSON.parse(pendingUserInfo);
                    const userData = {
                        id: userInfo.providerUserId,
                        nickname: userInfo.name,
                        email: userInfo.email,
                        profileImage: userInfo.profileUrl,
                        provider: userInfo.provider.toLowerCase(), // 소문자로 변환
                    };
                    localStorage.setItem('userData', JSON.stringify(userData));
                    console.log('✅ User data saved to localStorage after signup:', userData);
                    
                    // pendingUserInfo 정리
                    localStorage.removeItem('pendingUserInfo');
                } catch (error) {
                    console.error('❌ Failed to parse pendingUserInfo:', error);
                }
            }
            
            // 기존 쿠키 제거 (있다면)
            document.cookie = 'beeve_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'beeve_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('🧹 Cleared old cookies (beeve_auth, beeve_token)');
            
            // localStorage 전체 상태 확인
            console.log('📦 Current localStorage keys:', Object.keys(localStorage));
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





