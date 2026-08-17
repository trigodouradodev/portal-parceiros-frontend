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
import { ChipButton } from "@/features/originacao/components/ChipButton";
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
  toggleItem,
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
  const governmentPrograms = watch("registration.governmentPrograms");
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
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              É uma renovação de contrato?
            </Label>
            <YesNoChips value={field.value} onChange={field.onChange} />
          </div>
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
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">Gênero</Label>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={field.value === option}
                  onClick={() => field.onChange(option)}
                >
                  {option}
                </ChipButton>
              ))}
            </div>
          </div>
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Profissão
            </Label>
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
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
        )}
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Categoria da atividade
        </Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_CATEGORY_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={activityCategories.includes(option)}
              onClick={() =>
                setValue(
                  "registration.activityCategories",
                  toggleItem(activityCategories, option),
                  { shouldDirty: true },
                )
              }
            >
              {option}
            </ChipButton>
          ))}
        </div>
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
      </div>

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
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-[#1A1D2E]">
                  Estado civil
                </Label>
                <div className="flex flex-wrap gap-2">
                  {MARITAL_STATUS_OPTIONS.map((option) => (
                    <ChipButton
                      key={option}
                      active={field.value === option}
                      onClick={() => field.onChange(option)}
                    >
                      {option}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}
          />

          {spouseRequired ? (
            <FormField
              control={control}
              name="registration.spouseCpf"
              render={({ field }) => (
                <InputField
                  label="CPF do cônjuge"
                  value={formatCpf(field.value)}
                  onChange={(value) => field.onChange(formatCpf(value))}
                  icon={<CreditCard size={16} />}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  error={cpfFieldError(field.value)}
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-[#1A1D2E]">
                  Situação do imóvel
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_STATUS_OPTIONS.map((option) => (
                    <ChipButton
                      key={option}
                      active={field.value === option}
                      onClick={() => field.onChange(option)}
                    >
                      {option}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}
          />

          <FormField
            control={control}
            name="registration.residenceTime"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-[#1A1D2E]">
                  Tempo de residência
                </Label>
                <div className="flex flex-wrap gap-2">
                  {RESIDENCE_TIME_OPTIONS.map((option) => (
                    <ChipButton
                      key={option}
                      active={field.value === option}
                      onClick={() => field.onChange(option)}
                    >
                      {option}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Vínculo a programas de governo
            </Label>
            <div className="flex flex-wrap gap-2">
              {GOVERNMENT_PROGRAM_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={governmentPrograms.includes(option)}
                  onClick={() =>
                    setValue(
                      "registration.governmentPrograms",
                      toggleItem(governmentPrograms, option),
                      { shouldDirty: true },
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
            <YesNoChips value={hasVehicle} onChange={handleHasVehicleChange} />
          </div>

          {hasVehicle ? (
            <FormField
              control={control}
              name="registration.vehicleFinanced"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-[#1A1D2E]">
                    Veículo financiado?
                  </Label>
                  <YesNoChips value={field.value} onChange={field.onChange} />
                </div>
              )}
            />
          ) : null}
        </div>
      </div>

      <FormField
        control={control}
        name="registration.creditPurpose"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Finalidade do crédito
            </Label>
            <div className="flex flex-wrap gap-2">
              {CREDIT_PURPOSE_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={field.value === option}
                  onClick={() => field.onChange(option)}
                >
                  {option}
                </ChipButton>
              ))}
            </div>
          </div>
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-[#1A1D2E]">
                  Credor
                </Label>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
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
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
