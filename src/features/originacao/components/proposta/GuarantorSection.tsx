import { useFormContext } from "react-hook-form";
import { CreditCard, Mail, Phone, User } from "lucide-react";
import { DateFilterField } from "@/components/ui/date-filter-field";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { toSelectOptions } from "@/components/ui/select-option";
import { AddressFields } from "@/features/originacao/components/AddressFields";
import {
  GUARANTOR_MOCK_ADDRESS,
  KINSHIP_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import {
  calcAge,
  isAdultAge,
  todayIsoLocal,
} from "@/features/originacao/utils/calc-age";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import { cpfFieldError } from "@/lib/validation/cpf";

const TODAY_ISO = todayIsoLocal();

export function GuarantorSection() {
  const { control } = useFormContext<ProposalFormData>();

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={control}
        name="guarantor.name"
        render={({ field, fieldState }) => (
          <InputField
            name={field.name}
            label="Nome do avalista"
            value={field.value}
            onChange={field.onChange}
            icon={<User size={16} />}
            placeholder="Nome completo"
            required
            error={fieldState.error?.message}
          />
        )}
      />
      <FormField
        control={control}
        name="guarantor.cpf"
        render={({ field, fieldState }) => (
          <InputField
            name={field.name}
            label="CPF do avalista"
            value={field.value}
            onChange={(value) => field.onChange(formatCpf(value))}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
            error={fieldState.error?.message ?? cpfFieldError(field.value)}
          />
        )}
      />
      <FormField
        control={control}
        name="guarantor.birthDate"
        render={({ field, fieldState }) => {
          const age = calcAge(field.value);
          const ageInvalid = age !== null && !isAdultAge(age);
          return (
            <DateFilterField
              name={field.name}
              label="Data de nascimento"
              value={field.value}
              onChange={field.onChange}
              max={TODAY_ISO}
              captionLayout="dropdown"
              required
              error={
                fieldState.error?.message ??
                (ageInvalid
                  ? "O avalista deve ter entre 18 e 120 anos."
                  : undefined)
              }
            />
          );
        }}
      />
      <FormField
        control={control}
        name="guarantor.email"
        render={({ field, fieldState }) => (
          <InputField
            name={field.name}
            label="Email do avalista"
            value={field.value}
            onChange={field.onChange}
            icon={<Mail size={16} />}
            placeholder="avalista@email.com"
            type="email"
            required
            error={fieldState.error?.message}
          />
        )}
      />
      <FormField
        control={control}
        name="guarantor.phone"
        render={({ field, fieldState }) => (
          <InputField
            name={field.name}
            label="Telefone do avalista"
            value={field.value}
            onChange={(value) => field.onChange(formatPhone(value))}
            icon={<Phone size={16} />}
            placeholder="(11) 99999-0000"
            inputMode="tel"
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="border-t border-[#E2E4EC] pt-2">
        <p className="mb-3 text-sm font-semibold text-[#1A1D2E]">
          Endereço do avalista
        </p>
        <div className="flex flex-col gap-5">
          <AddressFields namePrefix="guarantor" mock={GUARANTOR_MOCK_ADDRESS} />
        </div>
      </div>

      <FormField
        control={control}
        name="guarantor.kinship"
        render={({ field, fieldState }) => (
          <SelectDialogField
            name={field.name}
            label="Grau de parentesco com o tomador"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(KINSHIP_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}
