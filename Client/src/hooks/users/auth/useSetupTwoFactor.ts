import { useMutation } from "@tanstack/react-query";
import apiClient from "@api/apiClient.ts";

export type SetupTwoFactorResponse = {
  secret: string;
  otpauthUrl: string;
};

async function setupTwoFactor() {
  return await apiClient.post<SetupTwoFactorResponse>("/users/2fa/setup");
}

export function useSetupTwoFactor() {
  return useMutation({
    mutationFn: setupTwoFactor,
  });
}
