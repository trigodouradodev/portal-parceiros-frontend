import type { NavigateFunction } from "react-router-dom";

export function exitRegisterAction(
  navigate: NavigateFunction,
  clearActionData: () => void,
) {
  clearActionData();
  navigate("/", { replace: true });
}
