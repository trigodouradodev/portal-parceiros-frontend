import { useEffect } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";
import { mapPartyToIdentityFill } from "@/features/originacao/mappers/map-party-to-guarantor";
import type { SimulationFormValues } from "@/features/originacao/schemas/simulation-form";
import { isValidCpf } from "@/lib/validation/cpf";

export function useSimulationPartyAutoFill(
  setValue: UseFormSetValue<SimulationFormValues>,
  options?: { lookupOnMountCpf?: string },
) {
  const { status, onCpfComplete, onCpfIncomplete } = usePartyLookup((party) => {
    const fill = mapPartyToIdentityFill(party);
    const fieldOptions = { shouldDirty: true, shouldValidate: true };
    if (fill.name) setValue("name", fill.name, fieldOptions);
    if (fill.email) setValue("email", fill.email, fieldOptions);
    if (fill.phone) setValue("phone", fill.phone, fieldOptions);
  });

  const mountCpf = options?.lookupOnMountCpf;
  useEffect(() => {
    const digits = (mountCpf ?? "").replace(/\D/g, "");
    if (isValidCpf(digits)) onCpfComplete(digits);
  }, [mountCpf, onCpfComplete]);

  return { status, onCpfComplete, onCpfIncomplete };
}
