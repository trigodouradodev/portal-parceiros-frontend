import { useFormContext } from "react-hook-form";
import { AlertCircle, CreditCard, Mail, Phone, User } from "lucide-react";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressFields } from "@/features/originacao/components/AddressFields";
import {
  GUARANTOR_MOCK_ADDRESS,
  KINSHIP_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { calcAge, isAdultAge } from "@/features/originacao/utils/calc-age";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import { cpfFieldError } from "@/lib/validation/cpf";

export function GuarantorSection() {
  const { control } = useFormContext<ProposalFormData>();

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={control}
        name="guarantor.name"
        render={({ field }) => (
          <InputField
            label="Nome do avalista"
            value={field.value}
            onChange={field.onChange}
            icon={<User size={16} />}
            placeholder="Nome completo"
          />
        )}
      />
      <FormField
        control={control}
        name="guarantor.cpf"
        render={({ field }) => (
          <InputField
            label="CPF do avalista"
            value={field.value}
            onChange={(value) => field.onChange(formatCpf(value))}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            error={cpfFieldError(field.value)}
          />
        )}
      />
      <FormField
        control={control}
        name="guarantor.birthDate"
        render={({ field }) => {
          const age = calcAge(field.value);
          const ageInvalid = age !== null && !isAdultAge(age);
          return (
            <div className="flex flex-col gap-1.5">
              <InputField
                label="Data de nascimento"
                value={field.value}
                onChange={field.onChange}
                icon={<User size={16} />}
                type="date"
              />
              {ageInvalid ? (
                <div className="flex items-center gap-1.5 text-xs text-[#D84040]">
                  <AlertCircle size={12} />O avalista deve ter entre 18 e 120
                  anos.
                </div>
              ) : null}
            </div>
          );
        }}
      />
      <FormField
        control={control}
        name="guarantor.email"
        render={({ field }) => (
          <InputField
            label="Email do avalista"
            value={field.value}
            onChange={field.onChange}
            icon={<Mail size={16} />}
            placeholder="avalista@email.com"
            type="email"
          />
        )}
      />
      <FormField
        control={control}
        name="guarantor.phone"
        render={({ field }) => (
          <InputField
            label="Telefone do avalista"
            value={field.value}
            onChange={(value) => field.onChange(formatPhone(value))}
            icon={<Phone size={16} />}
            placeholder="(11) 99999-0000"
            inputMode="tel"
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
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Grau de parentesco com o tomador
            </Label>
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {KINSHIP_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />
    </div>
  );
}
