import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth/auth.service";
import type { UpdateProfileRequest } from "@/services/auth/types";
import { useAuth } from "@/contexts/auth/auth-context";

export function useUpdateProfile() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (profile) => {
      setUser(profile);
    },
  });
}
