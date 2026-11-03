export function PerformanceError({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-[#F5C9C9] bg-white p-5"
    >
      <p className="text-sm text-[#A32D2D]">
        Não foi possível carregar o desempenho. Tente novamente.
      </p>
      <button
        type="button"
        disabled={retrying}
        onClick={onRetry}
        className="mt-3 min-h-11 rounded-lg border border-brand-navy px-4 text-sm font-semibold text-brand-navy disabled:opacity-50"
      >
        {retrying ? "Tentando novamente..." : "Tentar novamente"}
      </button>
    </div>
  );
}
