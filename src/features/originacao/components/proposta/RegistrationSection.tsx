import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormDate,
  FormInput,
  FormSelect,
  FormYesNo,
} from "@/components/ui/rhf-fields";
import { EmailDeliverabilityHint } from "@/features/originacao/components/proposta/EmailDeliverabilityHint";
import { FormSection } from "@/features/originacao/components/proposta/FormSection";
import type { EmailDeliverabilityStatus } from "@/features/originacao/hooks/useEmailDeliverability";
import {
  CHILDREN_COUNT_SELECT_OPTIONS,
  CREDIT_CARD_ICON,
  CREDIT_PURPOSE_SELECT_OPTIONS,
  DEBT_CREDITOR_SELECT_OPTIONS,
  EYE_ICON,
  EYE_OFF_ICON,
  GENDER_SELECT_OPTIONS,
  HOUSEHOLD_SIZE_SELECT_OPTIONS,
  ID_CARD_ICON,
  MAIL_ICON,
  MARITAL_STATUS_SELECT_OPTIONS,
  PHONE_ICON,
  PROPERTY_STATUS_SELECT_OPTIONS,
  RESIDENCE_TIME_SELECT_OPTIONS,
  USER_ICON,
} from "@/features/originacao/constants/registration-section";
import {
  DEBT_PURPOSE,
  hasSpouse,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { maxAdultBirthIso } from "@/features/originacao/utils/calc-age";
import { formatMonthlyRate } from "@/features/originacao/utils/format-monthly-rate";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";

const MAX_BIRTH_ISO = maxAdultBirthIso();

interface RegistrationSectionProps {
  product: string;
  rate: number;
  onRenewalChange?: (value: boolean) => void;
  emailDeliverabilityStatus: EmailDeliverabilityStatus;
}

export function RegistrationSection({
  product,
  rate,
  onRenewalChange,
  emailDeliverabilityStatus,
}: RegistrationSectionProps) {
  const { setValue, watch } = useFormContext<ProposalFormData>();
  const [showRate, setShowRate] = useState(false);
  const maritalStatus = watch("registration.maritalStatus");
  const creditPurpose = watch("registration.creditPurpose");
  const hasVehicle = watch("registration.hasVehicle");
  const spouseRequired = hasSpouse(maritalStatus);
  const debtRequired = creditPurpose === DEBT_PURPOSE;

  function handleHasVehicleChange(value: boolean) {
    if (!value) {
      setValue("registration.vehicleFinanced", null, { shouldDirty: true });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <FormYesNo<ProposalFormData>
        name="registration.isRenewal"
        label="É uma renovação de contrato?"
        required
        onChange={onRenewalChange}
      />

      <div className="rounded-2xl bg-muted px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Produto e taxa (definidos na simulação)
          </p>
          <button
            type="button"
            onClick={() => setShowRate((value) => !value)}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-navy"
          >
            {showRate ? EYE_OFF_ICON : EYE_ICON}
            {showRate ? "Ocultar" : "Mostrar taxa"}
          </button>
        </div>
        <p className="font-semibold text-foreground">
          {product}
          {showRate ? ` · ${formatMonthlyRate(rate)}` : ""}
        </p>
      </div>

      <FormInput<ProposalFormData>
        name="registration.name"
        label="Nome completo"
        icon={USER_ICON}
        placeholder="Nome do cliente"
        required
      />
      <FormDate<ProposalFormData>
        name="registration.birthDate"
        label="Data de nascimento"
        max={MAX_BIRTH_ISO}
        captionLayout="dropdown"
        required
      />

      <FormSelect<ProposalFormData>
        name="registration.gender"
        label="Gênero"
        options={GENDER_SELECT_OPTIONS}
        required
      />

      <FormInput<ProposalFormData>
        name="registration.cpf"
        label="CPF"
        transform={formatCpf}
        icon={CREDIT_CARD_ICON}
        placeholder="000.000.000-00"
        inputMode="numeric"
        maxLength={14}
        required
        disabled
      />
      <FormInput<ProposalFormData>
        name="registration.rg"
        label="RG"
        icon={ID_CARD_ICON}
        placeholder="Número do RG"
        maxLength={15}
        required
      />

      <FormInput<ProposalFormData>
        name="registration.email"
        label="E-mail"
        icon={MAIL_ICON}
        placeholder="cliente@email.com"
        type="email"
        required
      />
      <EmailDeliverabilityHint status={emailDeliverabilityStatus} />
      <FormInput<ProposalFormData>
        name="registration.phone"
        label="Celular"
        transform={formatPhone}
        icon={PHONE_ICON}
        placeholder="(11) 99999-0000"
        inputMode="tel"
        maxLength={15}
        required
      />

      <FormSection title="Composição familiar">
        <FormSelect<ProposalFormData>
          name="registration.maritalStatus"
          label="Estado civil"
          options={MARITAL_STATUS_SELECT_OPTIONS}
          required
        />

        {spouseRequired ? (
          <FormInput<ProposalFormData>
            name="registration.spouseCpf"
            label="CPF do cônjuge"
            transform={formatCpf}
            icon={CREDIT_CARD_ICON}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
          />
        ) : null}

        <div className="grid min-w-0 grid-cols-2 gap-3">
          <FormSelect<ProposalFormData>
            name="registration.childrenCount"
            label="Filhos menores de 18"
            options={CHILDREN_COUNT_SELECT_OPTIONS}
            required
          />
          <FormSelect<ProposalFormData>
            name="registration.householdSize"
            label="Pessoas na casa"
            options={HOUSEHOLD_SIZE_SELECT_OPTIONS}
            required
          />
        </div>

        <FormSelect<ProposalFormData>
          name="registration.propertyStatus"
          label="Situação do imóvel"
          options={PROPERTY_STATUS_SELECT_OPTIONS}
          required
        />

        <FormSelect<ProposalFormData>
          name="registration.residenceTime"
          label="Tempo de residência"
          options={RESIDENCE_TIME_SELECT_OPTIONS}
          required
        />

        <FormYesNo<ProposalFormData>
          name="registration.hasVehicle"
          label="Possui veículo?"
          onChange={handleHasVehicleChange}
          required
        />

        {hasVehicle ? (
          <FormYesNo<ProposalFormData>
            name="registration.vehicleFinanced"
            label="Veículo financiado?"
            required
          />
        ) : null}
      </FormSection>

      <FormSelect<ProposalFormData>
        name="registration.creditPurpose"
        label="Finalidade do crédito"
        options={CREDIT_PURPOSE_SELECT_OPTIONS}
        required
      />
      {debtRequired ? (
        <div className="flex flex-col gap-3">
          <FormInput<ProposalFormData>
            name="registration.debtDescription"
            label="Qual dívida?"
            placeholder="Descreva a dívida"
            required
          />
          <FormSelect<ProposalFormData>
            name="registration.debtCreditor"
            label="Credor"
            options={DEBT_CREDITOR_SELECT_OPTIONS}
            required
          />
        </div>
      ) : null}
    </div>
  );
}
