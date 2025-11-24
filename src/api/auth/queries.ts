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
    });
};

export const useSignUpQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.signUp(),
        mutationFn: (params: AuthSignUpRequest) => signUpApi(params),
    });
};

export const useRefreshTokenQuery = () => {
    return useMutation({
        mutationKey: authQueryKeys.refresh(),
        mutationFn: (params: {refreshToken: string}) => refreshTokenApi(params),
    });
};





