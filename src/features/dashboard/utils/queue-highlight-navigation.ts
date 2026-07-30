/** Location state ao voltar do registro de ação para a Home. */
export interface QueueHighlightNavigationState {
  highlightCompletedInstallmentId?: string;
}

export function buildCompletedHighlightNavigationState(
  installmentId: string | undefined,
): QueueHighlightNavigationState | undefined {
  if (!installmentId) return undefined;
  return { highlightCompletedInstallmentId: installmentId };
}
