import { useCallback, useState } from "react";
import { useQuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";
import { getApiErrorCode } from "@/lib/api/errors";
import { PartnerRestrictionCode } from "@/lib/partner-restrictions";

/**
 * Restrição de originação (AUREA-590) vista pela proposta aberta: vem do perfil
 * ou do 403 do envio, quando a restrição foi aplicada com a proposta já aberta.
 */
export function useOriginationRestriction() {
  const { data, dataUpdatedAt, refetch } = useQuoteActivityPermissions();
  const [submitBlockedAt, setSubmitBlockedAt] = useState<number | null>(null);

  // O 403 vale só até o perfil ser consultado de novo: a resposta mais recente
  // do servidor é a que manda, inclusive quando o Backoffice liberou o parceiro.
  const blockedBySubmit =
    submitBlockedAt !== null && dataUpdatedAt <= submitBlockedAt;
  const originationRestricted =
    blockedBySubmit || data?.originationRestricted === true;

  const handleSubmitError = useCallback(
    (err: unknown) => {
      if (
        getApiErrorCode(err) !== PartnerRestrictionCode.ORIGINATION_RESTRICTED
      ) {
        return;
      }
      setSubmitBlockedAt(Date.now());
      // Atualiza o perfil para o restante do Portal já refletir a restrição.
      void refetch();
    },
    [refetch],
  );

  return { originationRestricted, handleSubmitError };
}
