import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChipField } from "@/components/ui/chip-field";
import { FormField } from "@/components/ui/form";
import {
  FormDate,
  FormInput,
  FormSelect,
  FormYesNo,
} from "@/components/ui/rhf-fields";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { FormSection } from "@/features/originacao/components/proposta/FormSection";
import {
  ACTIVITY_CATEGORY_SELECT_OPTIONS,
  CREDIT_CARD_ICON,
  CREDIT_PURPOSE_SELECT_OPTIONS,
  DEBT_CREDITOR_SELECT_OPTIONS,
  EYE_ICON,
  EYE_OFF_ICON,
  GENDER_SELECT_OPTIONS,
  GOVERNMENT_PROGRAM_SELECT_OPTIONS,
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
  NONE_PROGRAM,
  OTHER_OPTION,
  hasSpouse,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { maxAdultBirthIso } from "@/features/originacao/utils/calc-age";
import { formatCount } from "@/features/originacao/utils/format-count";
import { formatMonthlyRate } from "@/features/originacao/utils/format-monthly-rate";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";

const MAX_BIRTH_ISO = maxAdultBirthIso();

interface RegistrationSectionProps {
  product: string;
  rate: number;
  onRenewalChange?: (value: boolean) => void;
}

export function RegistrationSection({
  product,
  rate,
  onRenewalChange,
}: RegistrationSectionProps) {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const [showRate, setShowRate] = useState(false);
  const maritalStatus = watch("registration.maritalStatus");
  const creditPurpose = watch("registration.creditPurpose");
  const activityCategories = watch("registration.activityCategories");
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

      <FormField
        control={control}
        name="registration.activityCategories"
        render={({ field, fieldState }) => (
          <SelectDialogField
            name={field.name}
            label="Atividade econômica"
            value={field.value[0] ?? ""}
            onChange={(value) => field.onChange(value ? [value] : [])}
            options={ACTIVITY_CATEGORY_SELECT_OPTIONS}
            required
            error={fieldState.error?.message}
          />
        )}
      />
      {activityCategories.includes(OTHER_OPTION) ? (
        <FormInput<ProposalFormData>
          name="registration.activityCategoryOther"
          label="Qual?"
          placeholder="Descreva a ocupação"
          required
        />
      ) : null}

      <FormInput<ProposalFormData>
        name="registration.occupation"
        label="Profissão"
        icon={USER_ICON}
        placeholder="Informe a profissão"
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
          <FormInput<ProposalFormData>
            name="registration.childrenCount"
            label="Filhos menores de 18"
            transform={formatCount}
            icon={USER_ICON}
            inputMode="numeric"
            maxLength={2}
            required
          />
          <FormInput<ProposalFormData>
            name="registration.householdSize"
            label="Pessoas na casa"
            transform={formatCount}
            icon={USER_ICON}
            inputMode="numeric"
            maxLength={2}
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

        <FormField
          control={control}
          name="registration.governmentPrograms"
          render={({ field, fieldState }) => (
            <ChipField
              name={field.name}
              label="Vínculo a programas de governo"
              multiple
              value={field.value}
              onChange={(value) => {
                if (
                  value.includes(NONE_PROGRAM) &&
                  !field.value.includes(NONE_PROGRAM)
                ) {
                  field.onChange([NONE_PROGRAM]);
                  return;
                }
                field.onChange(value.filter((item) => item !== NONE_PROGRAM));
              }}
              options={GOVERNMENT_PROGRAM_SELECT_OPTIONS}
              required
              error={fieldState.error?.message}
            />
          )}
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
