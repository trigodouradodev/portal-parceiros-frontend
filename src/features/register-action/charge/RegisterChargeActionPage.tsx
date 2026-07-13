import { PromiseDateModal } from "@/features/register-action/charge/components";
import { RegisterChargeFooterActions } from "@/features/register-action/charge/components/RegisterChargeFooterActions";
import { RegisterChargeStepContent } from "@/features/register-action/charge/components/RegisterChargeStepContent";
import {
  FLOW_STEPS,
  STEP_TITLES,
  useRegisterChargeActionFlow,
} from "@/features/register-action/charge/hooks/useRegisterChargeActionFlow";
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
      title={STEP_TITLES[flow.step]}
      client={flow.client}
      onBack={flow.handleBack}
      beforeContent={
        <RegisterStepIndicator
          steps={[...FLOW_STEPS]}
          currentStep={flow.currentStepIndex}
          connectorClassName="mx-2 h-px w-6 bg-border"
        />
      }
      footer={<RegisterChargeFooterActions flow={flow} />}
    >
      <RegisterFormCard>
        <RegisterChargeStepContent flow={flow} />
      </RegisterFormCard>

      <PromiseDateModal
        open={flow.promiseModalOpen}
        onOpenChange={flow.handlePromiseModalOpenChange}
        draftDate={flow.draftPromiseDate}
        onDraftDateChange={flow.setDraftPromiseDate}
        onConfirm={flow.confirmPromiseDate}
        minDate={flow.promiseDateMin}
        maxDate={flow.promiseDateMax}
      />
    </RegisterActionLayout>
  );
}
