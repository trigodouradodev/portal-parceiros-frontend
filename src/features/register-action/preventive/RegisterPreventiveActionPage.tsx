import { useNavigate } from "react-router-dom";
import { useActionContext } from "@/contexts/action";
import { PreventiveFollowUpForm } from "./PreventiveFollowUpForm";

export function RegisterPreventiveActionPage() {
  const navigate = useNavigate();
  const { client, onComplete } = useActionContext();

  if (!client) {
    return null;
  }

  return (
    <PreventiveFollowUpForm
      client={client}
      onBack={() => navigate(-1)}
      onSaved={(result) => {
        onComplete(result);
        navigate("/", { replace: true });
      }}
    />
  );
}
