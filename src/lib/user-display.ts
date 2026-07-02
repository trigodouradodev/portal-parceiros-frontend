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

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ROLE_ADMIN: "Administrador",
    ROLE_CONSULTANT: "Consultor",
    ROLE_MANAGER: "Gerente",
    ROLE_DIRECTOR: "Diretor",
    ROLE_COLLECTION_AGENT: "Agente de cobrança",
  };

  return labels[role] ?? role.replace(/^ROLE_/, "").replace(/_/g, " ");
}

export function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}
