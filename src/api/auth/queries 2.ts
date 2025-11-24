import { useMutation } from "@tanstack/react-query";
import { useRefreshTokenApi, useSignUpApi, useSocialAuthApi } from "./auth.api";
import { AuthLoginRequest, AuthSignUpRequest } from "@/types/auth";

export const authQueryKeys = {
    login: () => ['auth', 'login'] as const,
    refresh: () => ['auth', 'refresh'] as const,
    signUp: () => ['auth', 'signUp'] as const,
};

export const useLoginQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.login(),
        mutationFn: (params: AuthLoginRequest) => useSocialAuthApi(params),
    });
};

export const useSignUpQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.signUp(),
        mutationFn: (params: AuthSignUpRequest) => useSignUpApi(params),
    });
};

export const useRefreshTokenQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.refresh(),
        mutationFn: (params: {refreshToken: string}) => useRefreshTokenApi(params),
    });
};



