import { useMutation } from "@tanstack/react-query";
import { locationCheckService } from "@/services/location-check/location-check.service";
import type { VerifyLocationPayload } from "@/services/location-check/location-check.types";

export function useVerifyLocation() {
  return useMutation({
    mutationFn: (payload: VerifyLocationPayload) =>
      locationCheckService.verifyLocation(payload),
  });
}
