import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth/auth.service";
import type { ChangePasswordRequest } from "@/services/auth/types";

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authService.changePassword(data),
  });
}
