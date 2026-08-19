import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Pagination } from "@/components/data-table/Pagination";
import { PageContainer } from "@/components/layout/PageContainer";
import { Checkbox } from "@/components/ui/checkbox";
import { DateFilterField } from "@/components/ui/date-filter-field";
import { InputField } from "@/components/ui/input-field";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import type { SelectOption } from "@/components/ui/select-option";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractListCard } from "@/features/carteira/components/ContractListCard";
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
import { useProducts } from "@/hooks/useProducts";
import { getContractsListErrorMessage } from "@/lib/api/contracts-list-errors";
import { formatDate } from "@/lib/format/date";
import { fmtBRL } from "@/lib/utils";
import type { ContractListItem } from "@/services/contracts/contracts.types";

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

  // AUREA-330: abre a mesma tela rica de detalhe que a Home usa, num modo
  // somente-leitura — não mais um modal pequeno.
  function openContractDetail(contract: ContractListItem) {
    navigate(`/carteira/contratos/${contract.id}`);
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

  const productOptions: SelectOption[] = useMemo(
    () => [
      { value: ALL_PRODUCTS, label: "Todos os produtos" },
      ...(productsQuery.data ?? []).map((product) => ({
        value: product.id,
        label: product.description,
      })),
    ],
    [productsQuery.data],
  );

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
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-start">
            <InputField
              label="Cliente ou contrato"
              icon={<Search size={16} />}
              placeholder="Buscar cliente ou contrato…"
              value={searchInput}
              onChange={setSearchInput}
              className="md:flex-1"
            />
            <SelectDialogField
              label="Produto"
              value={filters.productId}
              onChange={(value) => patchFilters({ productId: value })}
              options={productOptions}
              className="md:w-48"
            />
            <DateFilterField
              label="Data inicial de desembolso"
              value={filters.startDate}
              onChange={(value) => patchFilters({ startDate: value })}
            />
            <DateFilterField
              label="Data final de desembolso"
              value={filters.endDate}
              onChange={(value) => patchFilters({ endDate: value })}
            />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Checkbox
              label="Só com saldo pendente"
              checked={filters.onlyActive}
              onCheckedChange={(checked) =>
                patchFilters({ onlyActive: checked })
              }
            />
            <Checkbox
              label="Só em atraso"
              checked={filters.onlyDelinquency}
              onCheckedChange={(checked) =>
                patchFilters({ onlyDelinquency: checked })
              }
            />
            <Checkbox
              label="Só renegociados"
              checked={filters.onlyRenegotiated}
              onCheckedChange={(checked) =>
                patchFilters({ onlyRenegotiated: checked })
              }
            />
          </div>
        </section>

        {contractsQuery.isPending && !contractsQuery.data ? (
          <>
            {/* Mobile: skeleton de card. Desktop: skeleton de linha. */}
            <div className="space-y-2 md:hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
            <div className="hidden space-y-2 rounded-xl border border-border p-4 md:block">
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
          <p className="py-8 text-center text-sm text-muted-foreground">
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

            <div className="hidden rounded-xl border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">
                      Valor desembolsado
                    </TableHead>
                    <TableHead className="text-right">Saldo pendente</TableHead>
                    <TableHead className="text-center">Parcelas</TableHead>
                    <TableHead>Próx. vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="whitespace-nowrap">
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
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {contract.clientName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {contract.productName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {fmtBRL(contract.disbursedAmount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {fmtBRL(contract.outstandingBalance)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {contract.totalInstallments}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {fmtDate(contract.nextDueDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            className="border-t border-border pt-3"
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
