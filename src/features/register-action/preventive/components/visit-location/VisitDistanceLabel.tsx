interface VisitDistanceLabelProps {
  distanceMeters?: number;
  radiusMeters?: number;
  variant: "confirmed" | "not_found";
  centered?: boolean;
}

export function VisitDistanceLabel({
  distanceMeters,
  radiusMeters,
  variant,
  centered = true,
}: VisitDistanceLabelProps) {
  if (distanceMeters === undefined || radiusMeters === undefined) {
    return null;
  }

  const radiusLabel =
    variant === "confirmed"
      ? `raio de ${radiusMeters}m`
      : `raio permitido: ${radiusMeters}m`;

  const text = `Distância: ${distanceMeters.toLocaleString("pt-BR")}m (${radiusLabel})${
    variant === "not_found" ? ". " : ""
  }`;

  if (variant === "not_found") {
    return <>{text}</>;
  }

  return (
    <p
      className={`text-xs text-muted-foreground${centered ? " text-center" : ""}`}
    >
      {text}
    </p>
  );
}
