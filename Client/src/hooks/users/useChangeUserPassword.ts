import { useMutation } from "@tanstack/react-query";
import apiClient from "@api/apiClient.ts";

interface ChangeUserPasswordDto {
  id?: string;
  oldPassword?: string;
  newPassword: string;
}

async function changeUserPassword({
  id,
  oldPassword,
  newPassword,
}: ChangeUserPasswordDto) {
  const url = id ? `users/${id}/password` : `users/password`;
  return await apiClient.patch(url, { oldPassword, newPassword });
}

/**
 * useChangeUserPassword Hook
 *
 * A custom hook that provides a mutation function to change a user's password.
 *
 * @hook
 */
export function useChangeUserPassword() {
  return useMutation({
    mutationFn: (data: ChangeUserPasswordDto) => changeUserPassword(data),
  });
}
