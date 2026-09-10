import { useMutation } from "@tanstack/react-query";
import apiClient from "@api/apiClient.ts";

export type LoginResponse = {
  token: string | null;
  refreshToken: string | null;
  requiresTwoFactor: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
  twoFactorCode?: string | null;
};

async function loginUser(params: LoginRequest) {
  return await apiClient.post<LoginResponse>(`/users/login`, params);
}

/**
 * useLoginMutation Hook
 *
 * A custom hook that provides functionality to log in a user.
 * If 2FA is enabled, the first request can return requiresTwoFactor=true
 * without issuing tokens. Tokens are stored only after full authentication.
 *
 * @hook
 */
export function useLoginMutation() {
  return useMutation({
    mutationFn: (params: LoginRequest) => loginUser(params),
    onSuccess: (data) => {
      const { token, refreshToken, requiresTwoFactor } = data.data;

      if (!requiresTwoFactor && token && refreshToken) {
        sessionStorage.setItem("token", token);
        localStorage.setItem("refresh-token", refreshToken);
      }
    },
  });
}
