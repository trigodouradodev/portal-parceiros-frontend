import { CreditCard, Mail, Phone, User } from "lucide-react";
import { FieldStatusMessage } from "@/components/ui/field-hint";
import { FormDate, FormInput, FormSelect } from "@/components/ui/rhf-fields";
import { AddressFields } from "@/features/originacao/components/AddressFields";
import { FormSection } from "@/features/originacao/components/proposta/FormSection";
import {
  KINSHIP_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { useGuarantorPartyAutoFill } from "@/features/originacao/hooks/useGuarantorPartyAutoFill";
import { maxAdultBirthIso } from "@/features/originacao/utils/calc-age";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import { isValidCpf } from "@/lib/validation/cpf";

const MAX_BIRTH_ISO = maxAdultBirthIso();

export function GuarantorSection() {
  const { status, onCpfComplete, onCpfIncomplete } =
    useGuarantorPartyAutoFill();

  function handleCpfChange(formatted: string) {
    if (isValidCpf(formatted)) {
      onCpfComplete(formatted.replace(/\D/g, ""));
    } else {
      onCpfIncomplete();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <FormInput<ProposalFormData>
        name="guarantor.name"
        label="Nome do avalista"
        icon={<User size={16} />}
        placeholder="Nome completo"
        required
      />
      <div className="flex flex-col gap-1.5">
        <FormInput<ProposalFormData>
          name="guarantor.cpf"
          label="CPF do avalista"
          transform={formatCpf}
          onValueChange={handleCpfChange}
          icon={<CreditCard size={16} />}
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
          required
        />
        {status === "searching" ? (
          <FieldStatusMessage tone="pending">
            Buscando cadastro…
          </FieldStatusMessage>
        ) : null}
        {status === "found" ? (
          <FieldStatusMessage tone="success">
            Cadastro encontrado e preenchido automaticamente
          </FieldStatusMessage>
        ) : null}
      </div>
      <FormDate<ProposalFormData>
        name="guarantor.birthDate"
        label="Data de nascimento"
        max={MAX_BIRTH_ISO}
        captionLayout="dropdown"
        required
      />
      <FormInput<ProposalFormData>
        name="guarantor.email"
        label="E-mail do avalista"
        icon={<Mail size={16} />}
        placeholder="avalista@email.com"
        type="email"
        required
      />
      <FormInput<ProposalFormData>
        name="guarantor.phone"
        label="Telefone do avalista"
        transform={formatPhone}
        icon={<Phone size={16} />}
        placeholder="(11) 99999-0000"
        inputMode="tel"
        required
      />

      <FormSection title="Endereço do avalista">
        <AddressFields namePrefix="guarantor" />
      </FormSection>

      <FormSelect<ProposalFormData>
        name="guarantor.kinship"
        label="Grau de parentesco com o tomador"
        options={KINSHIP_OPTIONS}
        required
      />
    </div>
  );
}
