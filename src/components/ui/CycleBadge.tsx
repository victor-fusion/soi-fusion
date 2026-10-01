import { Badge } from "@mantine/core";
import { cycleColor } from "@/lib/cycle-utils";

interface CycleBadgeProps {
  number: number;
  size?: "xs" | "sm" | "md";
}

/** Etiqueta de color de un ciclo (mismo estilo que el tipo en Recursos). */
export function CycleBadge({ number, size = "xs" }: CycleBadgeProps) {
  const color = cycleColor(number);
  return (
    <Badge
      size={size}
      variant="light"
      styles={{ root: { backgroundColor: `${color}15`, color, flexShrink: 0 } }}
    >
      Ciclo {number}
    </Badge>
  );
}
