interface SectionPlaceholderProps {
  title: string;
  description: string;
}

export function SectionPlaceholder({
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:px-8 md:pb-8">
      <div className="mb-6 max-w-xl">
        <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#6B7080]">{description}</p>
      </div>
      <section className="max-w-xl rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
        <p className="text-sm text-[#6B7080]">
          Conteúdo desta etapa entra na próxima entrega.
        </p>
      </section>
    </div>
  );
}
