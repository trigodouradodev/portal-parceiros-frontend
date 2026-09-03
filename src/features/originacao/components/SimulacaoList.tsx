import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { OriginacaoEmptyState } from "@/features/originacao/components/OriginacaoEmptyState";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import { SimulacaoListItem } from "@/features/originacao/components/SimulacaoListItem";
import { isSimulationConverted } from "@/features/originacao/data/simulacao";
import {
  SIMULATIONS_SEARCH_DEBOUNCE_MS,
  buildSimulationsListQuery,
  isSimulationsFilterActive,
} from "@/features/originacao/data/simulations-list-query";
import type { SimulationSnapshot } from "@/features/originacao/types";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

const CREATE_QUOTE_BLOCKED_MESSAGE =
  "Você possui ações de cobrança pendentes que impedem iniciar uma proposta.";

interface SimulacaoListProps {
  hasUnfilteredSimulations: boolean;
  canCreateQuote?: boolean;
  onNewSimulation: () => void;
  onEdit: (snapshot: SimulationSnapshot) => void;
  onStartProposal: (snapshot: SimulationSnapshot) => void | Promise<void>;
}

export function SimulacaoList({
  hasUnfilteredSimulations,
  canCreateQuote = true,
  onNewSimulation,
  onEdit,
  onStartProposal,
}: SimulacaoListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState(() => buildSimulationsListQuery(""));
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters(buildSimulationsListQuery(searchInput));
    }, SIMULATIONS_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: originationKeys.simulations(filters),
    queryFn: () => originationService.listSimulations(filters),
    placeholderData: keepPreviousData,
  });

  const simulations = listQuery.data ?? [];
  const filterActive = isSimulationsFilterActive(filters);
  const showFilters = hasUnfilteredSimulations || filterActive;
  const isLoading = listQuery.isPending && !listQuery.data;
  const isError = listQuery.isError;
  const noUnfiltered = !hasUnfilteredSimulations && !filterActive;
  const noMatch = filterActive && simulations.length === 0;

  function clearFilters() {
    setSearchInput("");
    setFilters({});
  }

  async function handleStartProposal(item: SimulationSnapshot) {
    if (!canCreateQuote || isSimulationConverted(item) || startingId != null) {
      return;
    }
    setStartingId(item.id);
    try {
      await onStartProposal(item);
    } finally {
      setStartingId(null);
    }
  }

  return (
    <OriginacaoPageFrame
      title="Simulações"
      description="Simulações salvas deste parceiro."
      actions={
        <Button
          variant="yellow"
          size="pillSm"
          className="shrink-0 gap-1.5"
          onClick={onNewSimulation}
        >
          <Plus size={15} />
          Nova simulação
        </Button>
      }
    >
      {showFilters ? (
        <div className="mb-4 flex flex-col gap-3">
          <InputField
            label="Nome ou CPF"
            icon={<Search size={16} />}
            placeholder="Buscar por nome ou CPF"
            value={searchInput}
            onChange={setSearchInput}
          />
          {isSimulationsFilterActive(buildSimulationsListQuery(searchInput)) ? (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-sm font-semibold text-brand-navy"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {canCreateQuote ? null : (
        <p className="mb-4 rounded-2xl bg-destructive-bg px-4 py-3 text-sm text-destructive">
          {CREATE_QUOTE_BLOCKED_MESSAGE}
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Carregando simulações…
        </div>
      ) : null}

      {!isLoading && isError ? (
        <OriginacaoEmptyState
          icon={<Plus size={22} />}
          title="Não foi possível carregar"
          description="Tente novamente em instantes."
          action={
            <Button
              variant="outline"
              size="pillSm"
              onClick={() => listQuery.refetch()}
            >
              Tentar novamente
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && noUnfiltered ? (
        <OriginacaoEmptyState
          icon={<Plus size={22} />}
          title="Nenhuma simulação ainda"
          description='Clique em "Nova simulação" para começar.'
        />
      ) : null}

      {!isLoading && !isError && noMatch ? (
        <OriginacaoEmptyState
          icon={<Search size={22} />}
          title="Nenhuma simulação encontrada"
          description="Tente outro nome ou CPF, ou limpe os filtros."
        />
      ) : null}

      {!isLoading && !isError && simulations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {simulations.map((item) => (
            <SimulacaoListItem
              key={item.id}
              item={item}
              canCreateQuote={canCreateQuote}
              startingId={startingId}
              onEdit={onEdit}
              onStartProposal={handleStartProposal}
            />
          ))}
        </div>
      ) : null}
    </OriginacaoPageFrame>
  );
}
