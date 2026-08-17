import type { WaTemplate } from "@/features/register-action/types/wa-template";
import { cn } from "@/lib/utils";
import { CopyTemplateButton } from "./CopyTemplateButton";

interface WhatsAppTemplatePickerProps {
  templates: WaTemplate[];
  clientFirstName?: string;
  selectedIndex: number;
  copiedIndex: number | null;
  onSelect: (index: number) => void;
  onCopy: (index: number) => void;
  variant: "compact" | "cards";
}

interface WhatsAppTemplateCardProps {
  template: WaTemplate;
  selected: boolean;
  interactive: boolean;
  showTag: boolean;
  copied: boolean;
  onSelect: () => void;
  onCopy: () => void;
}

function WhatsAppTemplateCard({
  template,
  selected,
  interactive,
  showTag,
  copied,
  onSelect,
  onCopy,
}: WhatsAppTemplateCardProps) {
  return (
    <div
      onClick={interactive ? onSelect : undefined}
      className={cn(
        "rounded-2xl border-2 p-4 transition-all",
        interactive && "cursor-pointer",
        selected
          ? "border-brand-navy bg-brand-yellow/10"
          : "border-border bg-white hover:border-input",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        {showTag && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              selected
                ? "bg-brand-navy text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {template.tag}
          </span>
        )}
        <CopyTemplateButton
          copied={copied}
          onClick={onCopy}
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-brand-navy",
            !showTag && "ml-auto",
          )}
        />
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        {template.message}
      </p>
    </div>
  );
}

export function WhatsAppTemplatePicker({
  templates,
  clientFirstName,
  selectedIndex,
  copiedIndex,
  onSelect,
  onCopy,
  variant,
}: WhatsAppTemplatePickerProps) {
  if (variant === "compact") {
    return (
      <div className="flex flex-col gap-2">
        {clientFirstName && (
          <p className="text-xs text-muted-foreground">
            Mensagem para {clientFirstName}:
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {templates.map((template, index) => (
            <button
              key={template.tag}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                selectedIndex === index
                  ? "bg-brand-navy text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {template.tag}
            </button>
          ))}
          <CopyTemplateButton
            copied={copiedIndex === selectedIndex}
            onClick={() => onCopy(selectedIndex)}
          />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {templates[selectedIndex]?.message}
        </p>
      </div>
    );
  }

  const singleTemplate = templates.length === 1;
  const interactive = !singleTemplate;

  return (
    <>
      {templates.map((template, index) => (
        <WhatsAppTemplateCard
          key={template.tag}
          template={template}
          selected={selectedIndex === index}
          interactive={interactive}
          showTag={!singleTemplate}
          copied={copiedIndex === index}
          onSelect={() => onSelect(index)}
          onCopy={() => onCopy(index)}
        />
      ))}
    </>
  );
}
