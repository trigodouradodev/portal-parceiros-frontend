import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface UseRegisterActionGuardOptions {
  ready: boolean;
  devSeed?: () => void;
}

export function useRegisterActionGuard({
  ready,
  devSeed,
}: UseRegisterActionGuardOptions) {
  const navigate = useNavigate();
  const devSeeded = useRef(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV && devSeed && !devSeeded.current && !ready) {
      devSeeded.current = true;
      devSeed();
      return;
    }

    if (!ready && !redirected.current) {
      redirected.current = true;
      navigate("/", { replace: true });
    }
  }, [ready, devSeed, navigate]);
}
