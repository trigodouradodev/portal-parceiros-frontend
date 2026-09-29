/**
 * O que gravar no formulário quando o cadastro do CPF troca de `previous` para
 * `next`: o que o cadastro novo tem entra; o que veio do anterior e o usuário
 * não editou sai. O que o usuário digitou fica (AUREA-500).
 */
export function partyFillUpdates<F extends string>(
  fields: readonly F[],
  previous: Partial<Record<F, string>>,
  next: Partial<Record<F, string>>,
  currentValue: (field: F) => unknown,
): Array<[F, string]> {
  const updates: Array<[F, string]> = [];
  for (const field of fields) {
    const value = next[field];
    if (value) {
      updates.push([field, value]);
    } else if (previous[field] && currentValue(field) === previous[field]) {
      updates.push([field, ""]);
    }
  }
  return updates;
}
