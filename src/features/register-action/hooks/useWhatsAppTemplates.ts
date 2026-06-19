import { useCallback, useState } from "react";
import type { WaTemplate } from "@/features/register-action/types/wa-template";

export function useWhatsAppTemplates(
  templates: WaTemplate[],
  initialIndex = 0,
) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = useCallback(
    (index: number) => {
      navigator.clipboard?.writeText(templates[index].message).catch(() => {});
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    },
    [templates],
  );

  return {
    selectedIndex,
    copiedIndex,
    setSelectedIndex,
    handleCopy,
  };
}
