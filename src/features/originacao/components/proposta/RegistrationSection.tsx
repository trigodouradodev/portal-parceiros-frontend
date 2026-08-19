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
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { toSelectOptions } from "@/components/ui/select-option";
import { YesNoField } from "@/components/ui/yes-no-field";
import {
  ACTIVITY_CATEGORY_OPTIONS,
  CREDIT_PURPOSE_OPTIONS,
  DEBT_CREDITOR_OPTIONS,
  DEBT_PURPOSE,
  GENDER_OPTIONS,
  GOVERNMENT_PROGRAM_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  OCCUPATION_OPTIONS,
  OTHER_OPTION,
  PROPERTY_STATUS_OPTIONS,
  RESIDENCE_TIME_OPTIONS,
  hasSpouse,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatCount } from "@/features/originacao/utils/format-count";
import { formatCpf } from "@/lib/format/tax-id";
import { cpfFieldError } from "@/lib/validation/cpf";

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
    setValue("registration.hasVehicle", value, { shouldDirty: true });
    if (!value) {
      setValue("registration.vehicleFinanced", null, { shouldDirty: true });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={control}
        name="registration.isRenewal"
        render={({ field, fieldState }) => (
          <YesNoField
            name={field.name}
            label="É uma renovação de contrato?"
            value={field.value}
            onChange={field.onChange}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="rounded-2xl bg-[#F5F6FA] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-[#6B7080]">
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
        <p className="font-semibold text-[#1A1D2E]">
          {product}
          {showRate ? ` · ${rate.toFixed(2).replace(".", ",")}% ao mês` : ""}
        </p>
      </div>

      <InputField
        label="Nome completo"
        value={name}
        onChange={() => {}}
        icon={<User size={16} />}
        disabled
      />
      <InputField
        label="Data de nascimento"
        value={birthDate}
        onChange={() => {}}
        icon={<User size={16} />}
        type="date"
        disabled
      />

      <FormField
        control={control}
        name="registration.gender"
        render={({ field, fieldState }) => (
          <ChipField
            name={field.name}
            label="Gênero"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(GENDER_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <InputField
        label="CPF"
        value={formatCpf(cpf)}
        onChange={() => {}}
        icon={<CreditCard size={16} />}
        disabled
      />
      <FormField
        control={control}
        name="registration.rg"
        render={({ field }) => (
          <InputField
            label="RG"
            value={field.value}
            onChange={field.onChange}
            icon={<IdCard size={16} />}
            placeholder="Número do RG"
            maxLength={15}
          />
        )}
      />

      <FormField
        control={control}
        name="registration.occupation"
        render={({ field }) => (
          <SelectField
            label="Profissão"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(OCCUPATION_OPTIONS)}
          />
        )}
      />

      <FormField
        control={control}
        name="registration.activityCategories"
        render={({ field, fieldState }) => (
          <ChipField
            name={field.name}
            label="Categoria da atividade"
            multiple
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(ACTIVITY_CATEGORY_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />
      {activityCategories.includes(OTHER_OPTION) ? (
        <FormField
          control={control}
          name="registration.activityCategoryOther"
          render={({ field }) => (
            <InputField
              label="Qual?"
              value={field.value}
              onChange={field.onChange}
              icon={<User size={16} />}
              placeholder="Descreva a ocupação"
            />
          )}
        />
      ) : null}

      <InputField
        label="Email"
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

      <div className="border-t border-[#E2E4EC] pt-2">
        <p className="mb-3 text-sm font-semibold text-[#1A1D2E]">
          Composição familiar
        </p>
        <div className="flex flex-col gap-5">
          <FormField
            control={control}
            name="registration.maritalStatus"
            render={({ field }) => (
              <ChipField
                label="Estado civil"
                value={field.value}
                onChange={field.onChange}
                options={toSelectOptions(MARITAL_STATUS_OPTIONS)}
              />
            )}
          />

          {spouseRequired ? (
            <FormField
              control={control}
              name="registration.spouseCpf"
              render={({ field, fieldState }) => (
                <InputField
                  name={field.name}
                  label="CPF do cônjuge"
                  value={formatCpf(field.value)}
                  onChange={(value) => field.onChange(formatCpf(value))}
                  icon={<CreditCard size={16} />}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  error={fieldState.error?.message ?? cpfFieldError(field.value)}
                />
              )}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name="registration.childrenCount"
              render={({ field }) => (
                <InputField
                  label="Filhos menores de 18"
                  value={field.value}
                  onChange={(value) => field.onChange(formatCount(value))}
                  icon={<User size={16} />}
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="0"
                />
              )}
            />
            <FormField
              control={control}
              name="registration.householdSize"
              render={({ field }) => (
                <InputField
                  label="Pessoas na casa"
                  value={field.value}
                  onChange={(value) => field.onChange(formatCount(value))}
                  icon={<User size={16} />}
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="0"
                />
              )}
            />
          </div>

          <FormField
            control={control}
            name="registration.propertyStatus"
            render={({ field }) => (
              <ChipField
                label="Situação do imóvel"
                value={field.value}
                onChange={field.onChange}
                options={toSelectOptions(PROPERTY_STATUS_OPTIONS)}
              />
            )}
          />

          <FormField
            control={control}
            name="registration.residenceTime"
            render={({ field }) => (
              <ChipField
                label="Tempo de residência"
                value={field.value}
                onChange={field.onChange}
                options={toSelectOptions(RESIDENCE_TIME_OPTIONS)}
              />
            )}
          />

          <FormField
            control={control}
            name="registration.governmentPrograms"
            render={({ field }) => (
              <ChipField
                label="Vínculo a programas de governo"
                multiple
                value={field.value}
                onChange={field.onChange}
                options={toSelectOptions(GOVERNMENT_PROGRAM_OPTIONS)}
              />
            )}
          />

          <YesNoField
            label="Possui veículo?"
            value={hasVehicle}
            onChange={handleHasVehicleChange}
          />

          {hasVehicle ? (
            <FormField
              control={control}
              name="registration.vehicleFinanced"
              render={({ field }) => (
                <YesNoField
                  label="Veículo financiado?"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          ) : null}
        </div>
      </div>

      <FormField
        control={control}
        name="registration.creditPurpose"
        render={({ field, fieldState }) => (
          <ChipField
            name={field.name}
            label="Finalidade do crédito"
            value={field.value ?? ""}
            onChange={field.onChange}
            options={toSelectOptions(CREDIT_PURPOSE_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />
      {debtRequired ? (
        <div className="flex flex-col gap-3">
          <FormField
            control={control}
            name="registration.debtDescription"
            render={({ field }) => (
              <InputField
                label="Qual dívida?"
                value={field.value}
                onChange={field.onChange}
                icon={<User size={16} />}
                placeholder="Descreva a dívida"
              />
            )}
          />
          <FormField
            control={control}
            name="registration.debtCreditor"
            render={({ field }) => (
              <SelectField
                label="Credor"
                value={field.value}
                onChange={field.onChange}
                options={toSelectOptions(DEBT_CREDITOR_OPTIONS)}
              />
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
