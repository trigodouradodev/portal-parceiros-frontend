import { useEffect, useState } from "react";
import {
  CreditCard,
  Eye,
  EyeOff,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import { OriginacaoFieldInput } from "@/features/originacao/components/OriginacaoFieldInput";
import { YesNoChips } from "@/features/originacao/components/YesNoChips";
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
  isRegistrationValid,
  toggleItem,
  type RegistrationData,
} from "@/features/originacao/data/proposal";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import { formatCount } from "@/features/originacao/utils/format-count";
import { cpfFieldError } from "@/features/originacao/utils/is-valid-cpf";

interface RegistrationSectionProps {
  product: string;
  rate: number;
  cpf: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  data: RegistrationData;
  onChange: (data: RegistrationData) => void;
  onValidChange: (valid: boolean) => void;
}

export function RegistrationSection({
  product,
  rate,
  cpf,
  name,
  birthDate,
  email,
  phone,
  data,
  onChange,
  onValidChange,
}: RegistrationSectionProps) {
  const [showRate, setShowRate] = useState(false);
  const spouseRequired = hasSpouse(data.maritalStatus);
  const debtRequired = data.creditPurpose === DEBT_PURPOSE;

  function set<K extends keyof RegistrationData>(
    key: K,
    value: RegistrationData[K],
  ) {
    onChange({ ...data, [key]: value });
  }

  useEffect(() => {
    onValidChange(isRegistrationValid(data));
  }, [data, onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          É uma renovação de contrato?
        </Label>
        <YesNoChips
          value={data.isRenewal}
          onChange={(value) => set("isRenewal", value)}
        />
      </div>

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

      <OriginacaoFieldInput
        label="Nome completo"
        value={name}
        onChange={() => {}}
        icon={<User size={16} />}
        disabled
      />
      <OriginacaoFieldInput
        label="Data de nascimento"
        value={birthDate}
        onChange={() => {}}
        icon={<User size={16} />}
        type="date"
        disabled
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">Gênero</Label>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={data.gender === option}
              onClick={() => set("gender", option)}
            >
              {option}
            </ChipButton>
          ))}
        </div>
      </div>

      <OriginacaoFieldInput
        label="CPF"
        value={formatCpf(cpf)}
        onChange={() => {}}
        icon={<CreditCard size={16} />}
        disabled
      />
      <OriginacaoFieldInput
        label="RG"
        value={data.rg}
        onChange={(value) => set("rg", value)}
        icon={<IdCard size={16} />}
        placeholder="Número do RG"
        maxLength={15}
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">Profissão</Label>
        <Select
          value={data.occupation || undefined}
          onValueChange={(value) => set("occupation", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {OCCUPATION_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Categoria da atividade
        </Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_CATEGORY_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={data.activityCategories.includes(option)}
              onClick={() =>
                set(
                  "activityCategories",
                  toggleItem(data.activityCategories, option),
                )
              }
            >
              {option}
            </ChipButton>
          ))}
        </div>
        {data.activityCategories.includes(OTHER_OPTION) ? (
          <OriginacaoFieldInput
            label="Qual?"
            value={data.activityCategoryOther}
            onChange={(value) => set("activityCategoryOther", value)}
            icon={<User size={16} />}
            placeholder="Descreva a ocupação"
          />
        ) : null}
      </div>

      <OriginacaoFieldInput
        label="Email"
        value={email}
        onChange={() => {}}
        icon={<Mail size={16} />}
        disabled
      />
      <OriginacaoFieldInput
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Estado civil
            </Label>
            <div className="flex flex-wrap gap-2">
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={data.maritalStatus === option}
                  onClick={() => set("maritalStatus", option)}
                >
                  {option}
                </ChipButton>
              ))}
            </div>
          </div>

          {spouseRequired ? (
            <OriginacaoFieldInput
              label="CPF do cônjuge"
              value={formatCpf(data.spouseCpf)}
              onChange={(value) => set("spouseCpf", formatCpf(value))}
              icon={<CreditCard size={16} />}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              error={cpfFieldError(data.spouseCpf)}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <OriginacaoFieldInput
              label="Filhos menores de 18"
              value={data.childrenCount}
              onChange={(value) => set("childrenCount", formatCount(value))}
              icon={<User size={16} />}
              inputMode="numeric"
              maxLength={2}
              placeholder="0"
            />
            <OriginacaoFieldInput
              label="Pessoas na casa"
              value={data.householdSize}
              onChange={(value) => set("householdSize", formatCount(value))}
              icon={<User size={16} />}
              inputMode="numeric"
              maxLength={2}
              placeholder="0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Situação do imóvel
            </Label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_STATUS_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={data.propertyStatus === option}
                  onClick={() => set("propertyStatus", option)}
                >
                  {option}
                </ChipButton>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Tempo de residência
            </Label>
            <div className="flex flex-wrap gap-2">
              {RESIDENCE_TIME_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={data.residenceTime === option}
                  onClick={() => set("residenceTime", option)}
                >
                  {option}
                </ChipButton>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Vínculo a programas de governo
            </Label>
            <div className="flex flex-wrap gap-2">
              {GOVERNMENT_PROGRAM_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={data.governmentPrograms.includes(option)}
                  onClick={() =>
                    set(
                      "governmentPrograms",
                      toggleItem(data.governmentPrograms, option),
                    )
                  }
                >
                  {option}
                </ChipButton>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Possui veículo?
            </Label>
            <YesNoChips
              value={data.hasVehicle}
              onChange={(value) => {
                if (!value) {
                  onChange({
                    ...data,
                    hasVehicle: false,
                    vehicleFinanced: null,
                  });
                  return;
                }
                set("hasVehicle", true);
              }}
            />
          </div>

          {data.hasVehicle ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#1A1D2E]">
                Veículo financiado?
              </Label>
              <YesNoChips
                value={data.vehicleFinanced}
                onChange={(value) => set("vehicleFinanced", value)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Finalidade do crédito
        </Label>
        <div className="flex flex-wrap gap-2">
          {CREDIT_PURPOSE_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={data.creditPurpose === option}
              onClick={() => set("creditPurpose", option)}
            >
              {option}
            </ChipButton>
          ))}
        </div>
        {debtRequired ? (
          <div className="mt-2 flex flex-col gap-3">
            <OriginacaoFieldInput
              label="Qual dívida?"
              value={data.debtDescription}
              onChange={(value) => set("debtDescription", value)}
              icon={<User size={16} />}
              placeholder="Descreva a dívida"
            />
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#1A1D2E]">
                Credor
              </Label>
              <Select
                value={data.debtCreditor || undefined}
                onValueChange={(value) => set("debtCreditor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_CREDITOR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
