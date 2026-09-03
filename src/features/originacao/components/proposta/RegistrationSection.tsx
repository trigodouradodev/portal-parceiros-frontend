import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChipField } from "@/components/ui/chip-field";
import { DateFilterField } from "@/components/ui/date-filter-field";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { FormInput, FormSelect, FormYesNo } from "@/components/ui/rhf-fields";
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
  noop,
} from "@/features/originacao/constants/registration-section";
import {
  DEBT_PURPOSE,
  NONE_PROGRAM,
  OTHER_OPTION,
  hasSpouse,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatCount } from "@/features/originacao/utils/format-count";
import { formatMonthlyRate } from "@/features/originacao/utils/format-monthly-rate";
import { formatCpf } from "@/lib/format/tax-id";

interface RegistrationSectionProps {
  product: string;
  rate: number;
  cpf: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
}

export function RegistrationSection({
  product,
  rate,
  cpf,
  name,
  birthDate,
  email,
  phone,
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

      <InputField
        label="Nome completo"
        value={name}
        onChange={noop}
        icon={USER_ICON}
        disabled
      />
      <DateFilterField
        label="Data de nascimento"
        value={birthDate}
        onChange={noop}
        disabled
      />

      <FormSelect<ProposalFormData>
        name="registration.gender"
        label="Gênero"
        options={GENDER_SELECT_OPTIONS}
        required
      />

      <InputField
        label="CPF"
        value={formatCpf(cpf)}
        onChange={noop}
        icon={CREDIT_CARD_ICON}
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

      <InputField
        label="E-mail"
        value={email}
        onChange={noop}
        icon={MAIL_ICON}
        disabled
      />
      <InputField
        label="Celular"
        value={phone}
        onChange={noop}
        icon={PHONE_ICON}
        disabled
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
            placeholder="0"
            required
          />
          <FormInput<ProposalFormData>
            name="registration.householdSize"
            label="Pessoas na casa"
            transform={formatCount}
            icon={USER_ICON}
            inputMode="numeric"
            maxLength={2}
            placeholder="0"
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
