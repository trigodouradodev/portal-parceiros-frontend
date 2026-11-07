import { OutcomeDateModal } from "@/features/register-action/charge/components";
import { RegisterChargeFooterActions } from "@/features/register-action/charge/components/RegisterChargeFooterActions";
import { RegisterChargeStepContent } from "@/features/register-action/charge/components/RegisterChargeStepContent";
import { useRegisterChargeActionFlow } from "@/features/register-action/charge/hooks/useRegisterChargeActionFlow";
import {
  RegisterActionLayout,
  RegisterFormCard,
  RegisterStepIndicator,
} from "@/features/register-action";

export function RegisterChargeActionPage() {
  const flow = useRegisterChargeActionFlow();

  if (!flow.client || !flow.taskId) {
    return null;
  }

  return (
    <RegisterActionLayout
      title={flow.stepTitle}
      client={flow.client}
      onBack={flow.handleBack}
      beforeContent={
        <RegisterStepIndicator
          steps={[...flow.flowSteps]}
          currentStep={flow.currentStepIndex}
          connectorClassName="mx-2 h-px w-6 bg-border"
        />
      }
      footer={<RegisterChargeFooterActions flow={flow} />}
    >
      <RegisterFormCard>
        <RegisterChargeStepContent flow={flow} />
      </RegisterFormCard>

      <OutcomeDateModal
        kind={flow.dateKind ?? "promise"}
        open={flow.dateModalOpen}
        onOpenChange={flow.handleDateModalOpenChange}
        draftDate={flow.draftDate}
        onDraftDateChange={flow.setDraftDate}
        onConfirm={flow.confirmOutcomeDate}
        minDate={flow.dateMin}
        maxDate={flow.dateMax}
      />
    </RegisterActionLayout>
  );
}
