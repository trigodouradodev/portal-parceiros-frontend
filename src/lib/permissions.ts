export const PORTAL_PERMISSIONS = {
  ROLE_COLLECTION_AGENT: "ROLE_COLLECTION_AGENT",
  QUOTE_NEW_ORIGINATION_FLOW: "QUOTE_NEW_ORIGINATION_FLOW",
} as const;

export function hasPermission(
  permissions: readonly string[] | undefined,
  permission: string,
): boolean {
  return permissions?.includes(permission) ?? false;
}
