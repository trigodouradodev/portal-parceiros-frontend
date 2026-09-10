import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { FieldErrorMessage, FieldLabel } from "@/components/ui/field-hint";
import { FormField } from "@/components/ui/form";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { OriginacaoToneBadge } from "@/features/originacao/components/OriginacaoSnapshotCard";
import { productRatePercent } from "@/features/originacao/data/simulacao";
import type { SimulationFormValues } from "@/features/originacao/schemas/simulation-form";
import type { ProductOption } from "@/services/products/products.types";
import { formatMonthlyRate } from "@/features/originacao/utils/format-monthly-rate";

interface SimulationProductFieldProps {
  products: ProductOption[];
  productsLoading: boolean;
  suggestedProductId: string | undefined;
}

export function SimulationProductField({
  products,
  productsLoading,
  suggestedProductId,
}: SimulationProductFieldProps) {
  const { control, watch } = useFormContext<SimulationFormValues>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showRate, setShowRate] = useState(false);

  const productId = watch("product");
  const selectedProduct = products.find((product) => product.id === productId);
  const rate = productRatePercent(selectedProduct);
  const showSuggestedBadge = productId === suggestedProductId;

  return (
    <FormField
      control={control}
      name="product"
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <FieldLabel required>Produto</FieldLabel>
          <div className="flex items-start justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
            <div>
              {showSuggestedBadge ? (
                <OriginacaoToneBadge tone="warning">
                  Sugerido
                </OriginacaoToneBadge>
              ) : null}
              <p className="font-semibold text-foreground">
                {selectedProduct?.description ??
                  (productsLoading
                    ? "Carregando produtos…"
                    : "Nenhum produto vinculado")}
              </p>
              {selectedProduct ? (
                <button
                  type="button"
                  onClick={() => setShowRate((value) => !value)}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  {showRate ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showRate
                    ? `Taxa de ${formatMonthlyRate(rate)} · definida pelo produto`
                    : "Mostrar taxa"}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              disabled={!products.length}
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-navy disabled:opacity-50"
            >
              <RefreshCw size={13} />
              Trocar
            </button>
          </div>
          <SelectDialogField
            hideTrigger
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            value={field.value}
            onChange={field.onChange}
            options={products.map((product) => ({
              value: product.id,
              label: product.description,
            }))}
          />
          <FieldErrorMessage error={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
