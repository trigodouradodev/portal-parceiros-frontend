import { useNavigate } from "react-router-dom";
import { useActionContext } from "@/contexts/action";
import { PreventiveFollowUpForm } from "./PreventiveFollowUpForm";

export function RegisterPreventiveActionPage() {
  const navigate = useNavigate();
  const { client, guarantor, onComplete } = useActionContext();

  if (!client) {
    return null;
  }

  return (
    <PreventiveFollowUpForm
      client={client}
      guarantor={guarantor}
      onBack={() => navigate(-1)}
      onSaved={(result) => {
        onComplete(result);
        navigate("/", { replace: true });
      }}
    />
  );
}
