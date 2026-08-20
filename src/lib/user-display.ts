export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  const first = parts[0][0] ?? "";
  if (parts.length === 1) return first.toUpperCase();

  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

const ROLE_LABELS: Record<string, string> = {
  CONSULTANT: "Consultor",
  CONSULT: "Consultor",
  COLLECTION_AGENT: "Agente de cobrança",
  ADMIN: "Administrador",
};

function normalizeRoleKey(role: string): string {
  return role
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/[\s-]+/g, "_");
}

export function getRoleLabel(role: string | undefined | null): string {
  if (!role) return "Agente";
  const key = normalizeRoleKey(role);
  return ROLE_LABELS[key] ?? ROLE_LABELS[role] ?? "Agente";
}
