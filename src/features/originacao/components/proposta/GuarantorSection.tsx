import {
  birthDateSchema,
  GUARANTOR_BIRTH_DATE_MESSAGE,
} from "@/features/originacao/schemas/birth-date";
import { CreditCard, Mail, Phone, User } from "lucide-react";
import { FieldStatusMessage } from "@/components/ui/field-hint";
import {
  FormDateInput,
  FormInput,
  FormSelect,
} from "@/components/ui/rhf-fields";
import { AddressFields } from "@/features/originacao/components/AddressFields";
import { EmailDeliverabilityHint } from "@/features/originacao/components/proposta/EmailDeliverabilityHint";
import { FormSection } from "@/features/originacao/components/proposta/FormSection";
import {
  KINSHIP_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import type { GuarantorPartyAutoFill } from "@/features/originacao/hooks/useGuarantorPartyAutoFill";
import type { EmailDeliverabilityStatus } from "@/features/originacao/hooks/useEmailDeliverability";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";

interface GuarantorSectionProps {
  emailDeliverabilityStatus: EmailDeliverabilityStatus;
  partyAutoFill: GuarantorPartyAutoFill;
}

export function GuarantorSection({
  emailDeliverabilityStatus,
  partyAutoFill: { status, onCpfChange },
}: GuarantorSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <FormInput<ProposalFormData>
          name="guarantor.cpf"
          label="CPF do avalista"
          transform={formatCpf}
          onValueChange={onCpfChange}
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
      <FormInput<ProposalFormData>
        name="guarantor.name"
        label="Nome do avalista"
        icon={<User size={16} />}
        placeholder="Nome completo"
        required
      />
      <FormDateInput<ProposalFormData>
        name="guarantor.birthDate"
        label="Data de nascimento"
        validationSchema={birthDateSchema(GUARANTOR_BIRTH_DATE_MESSAGE)}
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
      <EmailDeliverabilityHint status={emailDeliverabilityStatus} />
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
