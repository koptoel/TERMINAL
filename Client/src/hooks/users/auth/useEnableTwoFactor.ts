import { useMutation } from "@tanstack/react-query";
import apiClient from "@api/apiClient.ts";

async function enableTwoFactor(code: string) {
  return await apiClient.post("/users/2fa/enable", { code });
}

export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: enableTwoFactor,
  });
}
