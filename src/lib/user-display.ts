export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
  ROLE_CONSULTANT: "Consultor",
  ROLE_COLLECTION_AGENT: "Agente de cobrança",
  ROLE_ADMIN: "Administrador",
};

export function getRoleLabel(role: string | undefined | null): string {
  if (!role) return "Agente";
  return ROLE_LABELS[role] ?? role.replace(/^ROLE_/, "").replace(/_/g, " ");
}
