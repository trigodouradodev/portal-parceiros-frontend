import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { OriginacaoEmptyState } from "@/features/originacao/components/OriginacaoEmptyState";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import { OriginacaoProgress } from "@/features/originacao/components/OriginacaoProgress";
import {
  OriginacaoSnapshotCard,
  OriginacaoToneBadge,
} from "@/features/originacao/components/OriginacaoSnapshotCard";
import { PROPOSAL_STEPS } from "@/features/originacao/data/proposal";
import {
  QUOTES_SEARCH_DEBOUNCE_MS,
  buildQuotesListQuery,
  isQuotesFilterActive,
} from "@/features/originacao/data/quotes-list-query";
import { nextWizardStepIndex } from "@/features/originacao/mappers/map-quote-detail-to-form";
import { getBackofficeQuoteUrl } from "@/lib/backoffice";
import { quotesKeys, quotesService } from "@/services/quotes/quotes.service";
import type { QuoteListItem } from "@/services/quotes/quotes.types";
import {
  QuoteListAction,
  getQuoteListAction,
  getQuoteStatusPresentation,
  opensQuoteInBackoffice,
} from "@/services/quotes/quotes.status";

function formatTimestamp(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

interface ProposalListItemCardProps {
  item: QuoteListItem;
  openingId: string | null;
  onOpen: (item: QuoteListItem) => void;
}

function ProposalListItemCard({
  item,
  openingId,
  onOpen,
}: ProposalListItemCardProps) {
  const action = getQuoteListAction(item.status);
  const { label, tone } = getQuoteStatusPresentation(item.status);
  const step = nextWizardStepIndex(item.completedSteps);
  const busy = openingId === item.id;

  return (
    <OriginacaoSnapshotCard
      badge={<OriginacaoToneBadge tone={tone}>{label}</OriginacaoToneBadge>}
      timestamp={formatTimestamp(item.updatedAt)}
      name={item.name}
      amount={item.financeAmount}
      subtitle={item.productName}
      cpf={item.document}
    >
      {action === QuoteListAction.CONTINUE_DRAFT && item.canEdit ? (
        <>
          <OriginacaoProgress
            value={((step + 1) / PROPOSAL_STEPS.length) * 100}
          />
          <p className="text-xs text-muted-foreground">
            Passo {step + 1} de {PROPOSAL_STEPS.length} · {PROPOSAL_STEPS[step]}
          </p>
          <Button
            variant="outline"
            size="pillSm"
            disabled={openingId != null}
            onClick={() => onOpen(item)}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : null}
            Continuar preenchimento
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="pillSm"
          disabled={openingId != null}
          onClick={() => onOpen(item)}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : null}
          {action === QuoteListAction.FOLLOW_CLIENT_REVIEW
            ? "Acompanhar proposta"
            : "Ver proposta"}
        </Button>
      )}
    </OriginacaoSnapshotCard>
  );
}

interface ProposalListProps {
  onOpen: (id: string) => void | Promise<void>;
  openingId?: string | null;
}

export function ProposalList({ onOpen, openingId = null }: ProposalListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState(() => buildQuotesListQuery(""));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters(buildQuotesListQuery(searchInput, 1));
    }, QUOTES_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: quotesKeys.list(filters),
    queryFn: () => quotesService.list(filters),
    placeholderData: keepPreviousData,
  });

  const page = listQuery.data;
  const items = page?.items ?? [];
  const filterActive = isQuotesFilterActive(filters);
  const isLoading = listQuery.isPending && !listQuery.data;
  const isError = listQuery.isError;
  const noItems = !isLoading && !isError && items.length === 0 && !filterActive;
  const noMatch = filterActive && items.length === 0 && !isLoading;

  function clearFilters() {
    setSearchInput("");
    setFilters(buildQuotesListQuery(""));
  }

  async function handleOpen(item: QuoteListItem) {
    if (openingId != null) return;
    if (opensQuoteInBackoffice(getQuoteListAction(item.status))) {
      window.open(
        getBackofficeQuoteUrl(item.id),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    await onOpen(item.id);
  }

  return (
    <OriginacaoPageFrame
      title="Propostas"
      description="Rascunhos, revisão do cliente e propostas enviadas à análise."
    >
      <div className="mb-4 flex flex-col gap-3">
        <InputField
          label="Nome ou CPF"
          icon={<Search size={16} />}
          placeholder="Buscar por nome ou CPF"
          value={searchInput}
          onChange={setSearchInput}
        />
        {filterActive ? (
          <button
            type="button"
            onClick={clearFilters}
            className="self-start text-sm font-semibold text-brand-navy"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Carregando propostas…
        </div>
      ) : null}

      {isError ? (
        <OriginacaoEmptyState
          icon={<FileText size={22} />}
          title="Não foi possível carregar as propostas"
          description="Tente novamente em instantes."
          action={
            <Button
              variant="outline"
              size="pillSm"
              onClick={() => listQuery.refetch()}
            >
              Tentar de novo
            </Button>
          }
        />
      ) : null}

      {noItems ? (
        <OriginacaoEmptyState
          icon={<FileText size={22} />}
          title="Nenhuma proposta ainda"
          description="Inicie uma proposta a partir de uma simulação concluída."
        />
      ) : null}

      {noMatch ? (
        <OriginacaoEmptyState
          icon={<Search size={22} />}
          title="Nenhum resultado"
          description="Ajuste a busca ou limpe o filtro."
          action={
            <Button variant="outline" size="pillSm" onClick={clearFilters}>
              Limpar busca
            </Button>
          }
        />
      ) : null}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ProposalListItemCard
            key={item.id}
            item={item}
            openingId={openingId}
            onOpen={handleOpen}
          />
        ))}
      </div>

      {page && page.pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-2 text-sm">
          <Button
            variant="outline"
            size="pillSm"
            disabled={page.pagination.page <= 1 || listQuery.isFetching}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: Math.max(1, (prev.page ?? 1) - 1),
              }))
            }
          >
            Anterior
          </Button>
          <span className="text-muted-foreground">
            Página {page.pagination.page} de {page.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="pillSm"
            disabled={!page.pagination.hasNextPage || listQuery.isFetching}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: (prev.page ?? 1) + 1,
              }))
            }
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </OriginacaoPageFrame>
  );
}
