export function stageBadgeVariant(
  color: string,
): "blue" | "amber" | "red" | "green" | "teal" | "gray" | "muted" {
  const map: Record<
    string,
    "blue" | "amber" | "red" | "green" | "teal" | "gray" | "muted"
  > = {
    blue: "blue",
    amber: "amber",
    red: "red",
    green: "green",
    teal: "teal",
    gray: "gray",
  };
  return map[color] ?? "muted";
}
