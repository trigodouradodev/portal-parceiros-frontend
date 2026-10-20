import { useCallback, useState } from "react";
import { useQuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";
import { getApiErrorCode } from "@/lib/api/errors";
import { PartnerRestrictionCode } from "@/lib/partner-restrictions";

/**
 * Restrição de originação (AUREA-590) vista pela proposta aberta: vem do perfil
 * ou do 403 do envio, quando a restrição foi aplicada com a proposta já aberta.
 */
export function useOriginationRestriction() {
  const { data, refetch } = useQuoteActivityPermissions();
  const [blockedBySubmit, setBlockedBySubmit] = useState(false);

  const originationRestricted =
    blockedBySubmit || data?.originationRestricted === true;

  const handleSubmitError = useCallback(
    (err: unknown) => {
      if (
        getApiErrorCode(err) !== PartnerRestrictionCode.ORIGINATION_RESTRICTED
      ) {
        return;
      }
      setBlockedBySubmit(true);
      // Atualiza o perfil para o restante do Portal já refletir a restrição.
      void refetch();
    },
    [refetch],
  );

  return { originationRestricted, handleSubmitError };
}
