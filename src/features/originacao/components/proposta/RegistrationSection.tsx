import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  CreditCard,
  Eye,
  EyeOff,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { ChipField } from "@/components/ui/chip-field";
import { DateFilterField } from "@/components/ui/date-filter-field";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { FormInput, FormSelect, FormYesNo } from "@/components/ui/rhf-fields";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { toSelectOptions } from "@/components/ui/select-option";
import { FormSection } from "@/features/originacao/components/proposta/FormSection";
import {
  ACTIVITY_CATEGORY_OPTIONS,
  CREDIT_PURPOSE_OPTIONS,
  DEBT_CREDITOR_OPTIONS,
  DEBT_PURPOSE,
  GENDER_OPTIONS,
  GOVERNMENT_PROGRAM_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NONE_PROGRAM,
  OTHER_OPTION,
  PROPERTY_STATUS_OPTIONS,
  RESIDENCE_TIME_OPTIONS,
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
            {showRate ? <EyeOff size={13} /> : <Eye size={13} />}
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
        onChange={() => {}}
        icon={<User size={16} />}
        disabled
      />
      <DateFilterField
        label="Data de nascimento"
        value={birthDate}
        onChange={() => {}}
        disabled
      />

      <FormSelect<ProposalFormData>
        name="registration.gender"
        label="Gênero"
        options={toSelectOptions(GENDER_OPTIONS)}
        required
      />

      <InputField
        label="CPF"
        value={formatCpf(cpf)}
        onChange={() => {}}
        icon={<CreditCard size={16} />}
        disabled
      />
      <FormInput<ProposalFormData>
        name="registration.rg"
        label="RG"
        icon={<IdCard size={16} />}
        placeholder="Número do RG"
        maxLength={15}
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
            options={toSelectOptions(ACTIVITY_CATEGORY_OPTIONS)}
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
        icon={<User size={16} />}
        placeholder="Informe a profissão"
        required
      />

      <InputField
        label="E-mail"
        value={email}
        onChange={() => {}}
        icon={<Mail size={16} />}
        disabled
      />
      <InputField
        label="Celular"
        value={phone}
        onChange={() => {}}
        icon={<Phone size={16} />}
        disabled
      />

      <FormSection title="Composição familiar">
        <FormSelect<ProposalFormData>
          name="registration.maritalStatus"
          label="Estado civil"
          options={toSelectOptions(MARITAL_STATUS_OPTIONS)}
        />

        {spouseRequired ? (
          <FormInput<ProposalFormData>
            name="registration.spouseCpf"
            label="CPF do cônjuge"
            transform={formatCpf}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
          />
        ) : null}

        <div className="grid min-w-0 grid-cols-2 gap-3">
          <FormInput<ProposalFormData>
            name="registration.childrenCount"
            label="Filhos menores de 18"
            transform={formatCount}
            icon={<User size={16} />}
            inputMode="numeric"
            maxLength={2}
            placeholder="0"
          />
          <FormInput<ProposalFormData>
            name="registration.householdSize"
            label="Pessoas na casa"
            transform={formatCount}
            icon={<User size={16} />}
            inputMode="numeric"
            maxLength={2}
            placeholder="0"
          />
        </div>

        <FormSelect<ProposalFormData>
          name="registration.propertyStatus"
          label="Situação do imóvel"
          options={toSelectOptions(PROPERTY_STATUS_OPTIONS)}
        />

        <FormSelect<ProposalFormData>
          name="registration.residenceTime"
          label="Tempo de residência"
          options={toSelectOptions(RESIDENCE_TIME_OPTIONS)}
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
              options={toSelectOptions(GOVERNMENT_PROGRAM_OPTIONS)}
              error={fieldState.error?.message}
            />
          )}
        />

        <FormYesNo<ProposalFormData>
          name="registration.hasVehicle"
          label="Possui veículo?"
          onChange={handleHasVehicleChange}
        />

        {hasVehicle ? (
          <FormYesNo<ProposalFormData>
            name="registration.vehicleFinanced"
            label="Veículo financiado?"
          />
        ) : null}
      </FormSection>

      <FormSelect<ProposalFormData>
        name="registration.creditPurpose"
        label="Finalidade do crédito"
        options={toSelectOptions(CREDIT_PURPOSE_OPTIONS)}
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
            options={toSelectOptions(DEBT_CREDITOR_OPTIONS)}
            required
          />
        </div>
      ) : null}
    </div>
  );
}
