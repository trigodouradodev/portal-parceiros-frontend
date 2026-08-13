import { useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "@/components/data-table/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractDetailDialog } from "@/features/carteira/components/ContractDetailDialog";
import {
  ALL_PRODUCTS,
  SEARCH_DEBOUNCE_MS,
  applyDebouncedSearch,
  buildContractsListQuery,
  buildInitialFilters,
  type ContractsUiFilters,
} from "@/features/carteira/utils/contracts-list";
import { useContractsList } from "@/hooks/useContractsList";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useProducts } from "@/hooks/useProducts";
import { getContractsListErrorMessage } from "@/lib/api/contracts-list-errors";
import { formatDate } from "@/lib/format/date";
import { cn, fmtBRL } from "@/lib/utils";
import type {
  CarteiraDrillDownFilter,
  ContractListItem,
} from "@/services/contracts/contracts.types";

const CONTRACT_TABLE_HEADERS = [
  "Contrato",
  "Cliente",
  "Produto",
  "Valor Desembolsado",
  "Valor Projetado",
  "Saldo Pendente",
  "Parcelas Totais",
  "Data",
  "Próximo Vencimento",
] as const;

const MONEY_HEADERS = new Set([
  "Valor Desembolsado",
  "Valor Projetado",
  "Saldo Pendente",
]);

function fmtDate(value?: string): string {
  if (!value) return "—";
  return formatDate(value);
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
    initialFilter?.onlyActive ? "a" : "",
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
  const [selectedContract, setSelectedContract] =
    useState<ContractListItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragScroll = useDragScroll(scrollRef);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => applyDebouncedSearch(prev, searchInput) ?? prev);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useMemo(() => buildContractsListQuery(filters), [filters]);

  const contractsQuery = useContractsList(listQuery);
  const productsQuery = useProducts();

  function patchFilters(patch: Partial<ContractsUiFilters>) {
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
    <>
      <DialogContent className="max-h-[85vh] w-[95vw] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Empresa: CELCOIN · {total} contrato{total === 1 ? "" : "s"}{" "}
            encontrado
            {total === 1 ? "" : "s"}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex flex-col gap-2.5 md:flex-row">
          <Input
            type="text"
            placeholder="Buscar cliente ou contrato…"
            aria-label="Buscar cliente ou contrato"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="md:flex-1"
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
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => patchFilters({ startDate: e.target.value })}
            className="w-auto"
            aria-label="Data inicial de desembolso"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => patchFilters({ endDate: e.target.value })}
            className="w-auto"
            aria-label="Data final de desembolso"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#374151]">
            <input
              type="checkbox"
              checked={filters.onlyActive}
              onChange={(e) => patchFilters({ onlyActive: e.target.checked })}
            />
            Só com saldo pendente
          </label>
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

        {/*
          Tabela custom (não DataTable): coluna sticky + drag-scroll horizontal,
          que o DataTable compartilhado ainda não cobre. Paginação reusa o
          componente de data-table.
        */}
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
              {getContractsListErrorMessage(
                contractsQuery.error,
                "Não foi possível carregar os contratos.",
              )}
            </p>
          ) : (
            <table className="w-full min-w-[900px] text-xs">
              <thead className="bg-brand-navy">
                <tr>
                  {CONTRACT_TABLE_HEADERS.map((header) => (
                    <th
                      key={header}
                      className={cn(
                        "whitespace-nowrap px-3 py-2.5 font-semibold text-white/90",
                        header === "Parcelas Totais"
                          ? "text-center"
                          : MONEY_HEADERS.has(header)
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContract(contract);
                        }}
                      >
                        {contract.contractNumber}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#1A1D2E]">
                      {contract.clientName}
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
                    <td
                      colSpan={CONTRACT_TABLE_HEADERS.length}
                      className="py-8 text-center text-[#9DA3B4]"
                    >
                      Nenhum contrato encontrado com esses filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => {
              if (contractsQuery.isFetching) return;
              setFilters((prev) => ({ ...prev, page }));
            }}
            className="mt-4 border-t border-[#EBEDF3] pt-3"
          />
        ) : null}
      </DialogContent>

      <ContractDetailDialog
        contract={selectedContract}
        onOpenChange={(open) => {
          if (!open) setSelectedContract(null);
        }}
      />
    </>
  );
}
