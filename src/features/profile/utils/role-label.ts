const ROLE_LABELS: Record<string, string> = {
  ROLE_CONSULTANT: "Consultor",
  ROLE_COLLECTION_AGENT: "Agente de cobrança",
  ROLE_ADMIN: "Administrador",
};

export function getRoleLabel(role: string | undefined | null): string {
  if (!role) return "Agente";
  return ROLE_LABELS[role] ?? role.replace(/^ROLE_/, "").replace(/_/g, " ");
}
