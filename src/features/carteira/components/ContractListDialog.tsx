import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useContractsList } from "@/hooks/useContractsList";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useProducts } from "@/hooks/useProducts";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn, fmtBRL } from "@/lib/utils";
import type { CarteiraDrillDownFilter } from "@/services/contracts/contracts.types";

const ALL_PRODUCTS = "TODOS";
const PAGE_SIZE = 30;

interface UiFilters {
  search: string;
  productId: string;
  startDate: string;
  endDate: string;
  onlyDelinquency: boolean;
  onlyRenegotiated: boolean;
  page: number;
}

const EMPTY_FILTERS: UiFilters = {
  search: "",
  productId: ALL_PRODUCTS,
  startDate: "",
  endDate: "",
  onlyDelinquency: false,
  onlyRenegotiated: false,
  page: 1,
};

function buildInitialFilters(
  initialFilter?: CarteiraDrillDownFilter,
): UiFilters {
  return {
    ...EMPTY_FILTERS,
    onlyDelinquency: Boolean(initialFilter?.onlyDelinquency),
    onlyRenegotiated: Boolean(initialFilter?.onlyRenegotiated),
  };
}

function fmtDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

interface ContractListDialogProps {
  open: boolean;
  title: string;
  initialFilter?: CarteiraDrillDownFilter;
  onOpenChange: (open: boolean) => void;
}

export function ContractListDialog({
  open,
  title,
  initialFilter,
  onOpenChange,
}: ContractListDialogProps) {
  const sessionKey = [
    title,
    initialFilter?.onlyDelinquency ? "d" : "",
    initialFilter?.onlyRenegotiated ? "r" : "",
  ].join("|");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ContractListDialogBody
          key={sessionKey}
          title={title}
          initialFilter={initialFilter}
        />
      ) : null}
    </Dialog>
  );
}

interface ContractListDialogBodyProps {
  title: string;
  initialFilter?: CarteiraDrillDownFilter;
}

function ContractListDialogBody({
  title,
  initialFilter,
}: ContractListDialogBodyProps) {
  const [filters, setFilters] = useState(() =>
    buildInitialFilters(initialFilter),
  );
  const [searchInput, setSearchInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragScroll = useDragScroll(scrollRef);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev;
        return { ...prev, search: searchInput, page: 1 };
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useMemo(
    () => ({
      page: filters.page,
      limit: PAGE_SIZE,
      search: filters.search || undefined,
      products:
        filters.productId !== ALL_PRODUCTS ? [filters.productId] : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      onlyDelinquency: filters.onlyDelinquency || undefined,
      onlyRenegotiated: filters.onlyRenegotiated || undefined,
    }),
    [filters],
  );

  const contractsQuery = useContractsList(listQuery);
  const productsQuery = useProducts();

  function patchFilters(patch: Partial<UiFilters>) {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
    }));
  }

  const pagination = contractsQuery.data?.pagination;
  const items = contractsQuery.data?.items ?? [];
  const total = pagination?.total ?? items.length;

  return (
    <DialogContent className="max-h-[85vh] w-[95vw] max-w-5xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Empresa: CELCOIN · {total} contrato{total === 1 ? "" : "s"} encontrado
          {total === 1 ? "" : "s"}
        </DialogDescription>
      </DialogHeader>

      <div className="mb-4 flex flex-col gap-2.5 md:flex-row">
        <input
          type="text"
          placeholder="Buscar cliente ou contrato…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-full rounded border border-[#C8CBD8] bg-white px-3 text-sm text-[#1A1D2E] outline-none placeholder:text-[#9DA3B4] focus:border-brand-navy md:flex-1"
        />
        <Select
          value={filters.productId}
          onValueChange={(value) => patchFilters({ productId: value })}
        >
          <SelectTrigger className="w-full whitespace-nowrap md:w-48">
            <SelectValue placeholder="Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PRODUCTS}>Todos os produtos</SelectItem>
            {(productsQuery.data ?? []).map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => patchFilters({ startDate: e.target.value })}
          className="h-9 rounded border border-[#C8CBD8] bg-white px-2 text-sm text-[#1A1D2E] outline-none focus:border-brand-navy"
          aria-label="Data inicial de desembolso"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => patchFilters({ endDate: e.target.value })}
          className="h-9 rounded border border-[#C8CBD8] bg-white px-2 text-sm text-[#1A1D2E] outline-none focus:border-brand-navy"
          aria-label="Data final de desembolso"
        />
      </div>

      <div className="mb-4 flex gap-4">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#374151]">
          <input
            type="checkbox"
            checked={filters.onlyDelinquency}
            onChange={(e) =>
              patchFilters({ onlyDelinquency: e.target.checked })
            }
          />
          Só em atraso
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#374151]">
          <input
            type="checkbox"
            checked={filters.onlyRenegotiated}
            onChange={(e) =>
              patchFilters({ onlyRenegotiated: e.target.checked })
            }
          />
          Só renegociados
        </label>
      </div>

      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-[#9DA3B4]">
        <span>↔</span> Arraste a lista para o lado pra ver todas as colunas
      </div>

      <div
        ref={scrollRef}
        {...dragScroll}
        className="no-scrollbar cursor-grab overflow-x-auto rounded-xl border border-[#EBEDF3] select-none active:cursor-grabbing"
      >
        {contractsQuery.isPending && !contractsQuery.data ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : contractsQuery.isError ? (
          <p className="p-6 text-center text-sm text-[#A32D2D]">
            {getApiErrorMessage(
              contractsQuery.error,
              "Não foi possível carregar os contratos.",
            )}
          </p>
        ) : (
          <table className="w-full min-w-[1000px] text-xs">
            <thead className="bg-brand-navy">
              <tr>
                {[
                  "Contrato",
                  "Cliente",
                  "Empresa",
                  "Produto",
                  "Valor Desembolsado",
                  "Valor Projetado",
                  "Saldo Pendente",
                  "Parcelas Totais",
                  "Data",
                  "Próximo Vencimento",
                ].map((header) => (
                  <th
                    key={header}
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 font-semibold text-white/90",
                      header === "Parcelas Totais"
                        ? "text-center"
                        : [
                              "Valor Desembolsado",
                              "Valor Projetado",
                              "Saldo Pendente",
                            ].includes(header)
                          ? "text-right"
                          : "text-left",
                      header === "Contrato" &&
                        "sticky left-0 z-10 bg-brand-navy text-white",
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((contract) => (
                <tr key={contract.id} className="border-t border-[#EBEDF3]">
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-2">
                    <button
                      type="button"
                      className="font-semibold text-brand-navy underline decoration-brand-navy/30 hover:decoration-brand-navy"
                      title="Detalhe do contrato na próxima entrega"
                    >
                      {contract.contractNumber}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#1A1D2E]">
                    {contract.clientName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6B7080]">
                    {contract.companyName ?? "CELCOIN"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6B7080]">
                    {contract.productName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-[#1A1D2E]">
                    {fmtBRL(contract.disbursedAmount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-[#1A1D2E]">
                    {fmtBRL(contract.projectedAmount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-[#1A1D2E]">
                    {fmtBRL(contract.outstandingBalance)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-center text-[#1A1D2E]">
                    {contract.totalInstallments}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6B7080]">
                    {fmtDate(contract.disbursementDate)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6B7080]">
                    {fmtDate(contract.nextDueDate)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#9DA3B4]">
                    Nenhum contrato encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#EBEDF3] pt-3 text-[11px] text-[#9DA3B4]">
          <span>
            {pagination.page}/{pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page <= 1 || contractsQuery.isFetching}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            className="text-brand-navy underline decoration-brand-navy/30 disabled:opacity-40 hover:decoration-brand-navy"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!pagination.hasNextPage || contractsQuery.isFetching}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            className="text-brand-navy underline decoration-brand-navy/30 disabled:opacity-40 hover:decoration-brand-navy"
          >
            Próxima
          </button>
        </div>
      ) : null}
    </DialogContent>
  );
}
