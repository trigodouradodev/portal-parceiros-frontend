export interface SelectOption {
  value: string;
  label: string;
}

export function toSelectOptions(values: readonly string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}
