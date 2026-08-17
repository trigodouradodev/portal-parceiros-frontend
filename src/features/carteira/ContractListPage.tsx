import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Pagination } from "@/components/data-table/Pagination";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractListCard } from "@/features/carteira/components/ContractListCard";
import { DateFilterField } from "@/features/carteira/components/DateFilterField";
import {
  ALL_PRODUCTS,
  SEARCH_DEBOUNCE_MS,
  applyDebouncedSearch,
  buildContractsListQuery,
  buildInitialFilters,
  type ContractsUiFilters,
} from "@/features/carteira/utils/contracts-list";
import { parseContractListSearchParams } from "@/features/carteira/utils/contract-list-route";
import { useContractsList } from "@/hooks/useContractsList";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useProducts } from "@/hooks/useProducts";
import { getContractsListErrorMessage } from "@/lib/api/contracts-list-errors";
import { formatDate } from "@/lib/format/date";
import { cn, fmtBRL } from "@/lib/utils";
import type { ContractListItem } from "@/services/contracts/contracts.types";

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

/**
 * AUREA-330: lista de contratos do drill-down da Carteira como tela própria
 * (rota `/carteira/contratos`), não modal — mobile-first. Substituiu o antigo
 * `ContractListDialog`; título e pré-filtro chegam via querystring
 * (`buildContractListPath`), o que também torna a tela linkável/voltável
 * pelo botão nativo do navegador.
 */
export function ContractListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { title, initialFilter } = useMemo(
    () => parseContractListSearchParams(searchParams),
    [searchParams],
  );

  const [filters, setFilters] = useState<ContractsUiFilters>(() =>
    buildInitialFilters(initialFilter),
  );
  const [searchInput, setSearchInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragScroll = useDragScroll(scrollRef);

  // AUREA-330: abre a mesma tela rica de detalhe que a Home usa, num modo
  // somente-leitura — não mais um modal pequeno.
  function openContractDetail(contract: ContractListItem) {
    navigate(`/contracts/${contract.id}?mode=carteira`);
  }

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
    <PageContainer>
      <div className="bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8">
        <button
          type="button"
          onClick={() => navigate("/carteira")}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Carteira
        </button>
        <h1 className="font-fraunces text-2xl font-bold leading-tight text-white md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Empresa: CELCOIN · {total} contrato{total === 1 ? "" : "s"} encontrado
          {total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-5 md:px-8">
        <div className="flex flex-col gap-2.5 md:flex-row">
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
          <div className="grid grid-cols-2 gap-2.5 md:contents">
            <DateFilterField
              label="Data inicial"
              value={filters.startDate}
              onChange={(startDate) => patchFilters({ startDate })}
              maxDate={filters.endDate}
              dialogTitle="Data inicial de desembolso"
              dialogDescription="Filtra contratos desembolsados a partir desta data."
            />
            <DateFilterField
              label="Data final"
              value={filters.endDate}
              onChange={(endDate) => patchFilters({ endDate })}
              minDate={filters.startDate}
              dialogTitle="Data final de desembolso"
              dialogDescription="Filtra contratos desembolsados até esta data."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
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

        {contractsQuery.isPending && !contractsQuery.data ? (
          <>
            {/* Mobile: skeleton de card. Desktop: skeleton de linha. */}
            <div className="space-y-2 md:hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
            <div className="hidden space-y-2 rounded-xl border border-[#EBEDF3] p-4 md:block">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </>
        ) : contractsQuery.isError ? (
          <p className="p-6 text-center text-sm text-[#A32D2D]">
            {getContractsListErrorMessage(
              contractsQuery.error,
              "Não foi possível carregar os contratos.",
            )}
          </p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#9DA3B4]">
            Nenhum contrato encontrado com esses filtros.
          </p>
        ) : (
          <>
            {/* Mobile-first (AUREA-330): cards abaixo de md, tabela com
                drag-scroll a partir de md — tabela não cabe bem em telas
                estreitas mesmo com scroll horizontal. */}
            <div className="flex flex-col gap-2.5 md:hidden">
              {items.map((contract) => (
                <ContractListCard
                  key={contract.id}
                  contract={contract}
                  onOpen={() => openContractDetail(contract)}
                />
              ))}
            </div>

            <div
              ref={scrollRef}
              {...dragScroll}
              className="no-scrollbar hidden cursor-grab overflow-x-auto rounded-xl border border-[#EBEDF3] select-none active:cursor-grabbing md:block"
            >
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
                            openContractDetail(contract);
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
                </tbody>
              </table>
            </div>
            <div className="hidden items-center gap-1.5 text-[11px] text-[#9DA3B4] md:flex">
              <span>↔</span> Arraste a lista para o lado pra ver todas as
              colunas
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => {
              if (contractsQuery.isFetching) return;
              setFilters((prev) => ({ ...prev, page }));
            }}
            className="border-t border-[#EBEDF3] pt-3"
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
