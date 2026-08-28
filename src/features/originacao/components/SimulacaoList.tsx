import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { OriginacaoEmptyState } from "@/features/originacao/components/OriginacaoEmptyState";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import {
  OriginacaoSnapshotCard,
  OriginacaoToneBadge,
} from "@/features/originacao/components/OriginacaoSnapshotCard";
import {
  dueDayFromIsoDate,
  formatCreatedAtPtBr,
} from "@/features/originacao/data/simulacao";
import {
  SIMULATIONS_SEARCH_DEBOUNCE_MS,
  buildSimulationsListQuery,
  isSimulationsFilterActive,
} from "@/features/originacao/data/simulations-list-query";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { fmtBRL } from "@/lib/utils";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

interface SimulacaoListProps {
  hasUnfilteredSimulations: boolean;
  onNewSimulation: () => void;
  onStartProposal: (snapshot: SimulationSnapshot) => void;
}

export function SimulacaoList({
  hasUnfilteredSimulations,
  onNewSimulation,
  onStartProposal,
}: SimulacaoListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState(() => buildSimulationsListQuery(""));

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
              onClick={() => void listQuery.refetch()}
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
            <OriginacaoSnapshotCard
              key={item.id}
              badge={
                <OriginacaoToneBadge tone="warning">
                  {item.productName}
                </OriginacaoToneBadge>
              }
              timestamp={formatCreatedAtPtBr(item.createdAt)}
              name={item.name}
              amount={item.amount}
              subtitle={`${item.installments}x de ${fmtBRL(item.installmentAmount)} · vencimento dia ${String(dueDayFromIsoDate(item.firstInstallmentDate)).padStart(2, "0")}`}
              cpf={item.document}
            >
              <Button
                variant="outline"
                size="pillSm"
                onClick={() => onStartProposal(item)}
              >
                Iniciar proposta
              </Button>
            </OriginacaoSnapshotCard>
          ))}
        </div>
      ) : null}
    </OriginacaoPageFrame>
  );
}
