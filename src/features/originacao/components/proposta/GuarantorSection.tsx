import { useEffect } from "react";
import { AlertCircle, CreditCard, Mail, Phone, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MockAddressFields } from "@/features/originacao/components/MockAddressFields";
import { OriginacaoFieldInput } from "@/features/originacao/components/OriginacaoFieldInput";
import {
  GUARANTOR_MOCK_ADDRESS,
  KINSHIP_OPTIONS,
  isGuarantorValid,
  type GuarantorData,
} from "@/features/originacao/data/proposal";
import { calcAge, isAdultAge } from "@/features/originacao/utils/calc-age";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import { formatPhone } from "@/features/originacao/utils/format-phone";
import { cpfFieldError } from "@/features/originacao/utils/is-valid-cpf";

interface GuarantorSectionProps {
  data: GuarantorData;
  onChange: (data: GuarantorData) => void;
  onValidChange: (valid: boolean) => void;
}

export function GuarantorSection({
  data,
  onChange,
  onValidChange,
}: GuarantorSectionProps) {
  const age = calcAge(data.birthDate);
  const ageInvalid = age !== null && !isAdultAge(age);

  function set<K extends keyof GuarantorData>(key: K, value: GuarantorData[K]) {
    onChange({ ...data, [key]: value });
  }

  useEffect(() => {
    onValidChange(isGuarantorValid(data));
  }, [data, onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <OriginacaoFieldInput
        label="Nome do avalista"
        value={data.name}
        onChange={(value) => set("name", value)}
        icon={<User size={16} />}
        placeholder="Nome completo"
      />
      <OriginacaoFieldInput
        label="CPF do avalista"
        value={data.cpf}
        onChange={(value) => set("cpf", formatCpf(value))}
        icon={<CreditCard size={16} />}
        placeholder="000.000.000-00"
        inputMode="numeric"
        maxLength={14}
        error={cpfFieldError(data.cpf)}
      />
      <div className="flex flex-col gap-1.5">
        <OriginacaoFieldInput
          label="Data de nascimento"
          value={data.birthDate}
          onChange={(value) => set("birthDate", value)}
          icon={<User size={16} />}
          type="date"
        />
        {ageInvalid ? (
          <div className="flex items-center gap-1.5 text-xs text-[#D84040]">
            <AlertCircle size={12} />O avalista deve ter entre 18 e 120 anos.
          </div>
        ) : null}
      </div>
      <OriginacaoFieldInput
        label="Email do avalista"
        value={data.email}
        onChange={(value) => set("email", value)}
        icon={<Mail size={16} />}
        placeholder="avalista@email.com"
        type="email"
      />
      <OriginacaoFieldInput
        label="Telefone do avalista"
        value={data.phone}
        onChange={(value) => set("phone", formatPhone(value))}
        icon={<Phone size={16} />}
        placeholder="(11) 99999-0000"
        inputMode="tel"
      />

      <div className="border-t border-[#E2E4EC] pt-2">
        <p className="mb-3 text-sm font-semibold text-[#1A1D2E]">
          Endereço do avalista
        </p>
        <div className="flex flex-col gap-5">
          <MockAddressFields
            address={{
              zipCode: data.zipCode,
              street: data.street,
              number: data.number,
              complement: data.complement,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
            }}
            onAddressChange={(address) => onChange({ ...data, ...address })}
            mock={GUARANTOR_MOCK_ADDRESS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Grau de parentesco com o tomador
        </Label>
        <Select
          value={data.kinship || undefined}
          onValueChange={(value) => set("kinship", value)}
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
    </div>
  );
}
