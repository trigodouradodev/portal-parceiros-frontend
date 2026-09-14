/** Alinhado a `@IsNumber({ maxDecimalPlaces: 8 })` nos DTOs do portal. */
export const GEO_COORD_MAX_DECIMAL_PLACES = 8;

/** Arredonda lat/lng para o máximo aceito pela API. */
export function roundGeoCoordinate(value: number): number {
  return Number(value.toFixed(GEO_COORD_MAX_DECIMAL_PLACES));
}
