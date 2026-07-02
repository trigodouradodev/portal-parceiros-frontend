import type { ReactNode } from "react";
import {
  CheckCircle2,
  ChevronRight,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import {
  CHARGE_PIPELINE_CHANNELS,
  getChannelShortLabel,
  getPipelineStepStates,
  type PipelineStepState,
} from "@/features/dashboard/utils/charge-channel";
import {
  ActivityChannel,
  type ActivityTaskStatus,
} from "@/services/dashboard/dashboard.types";

const CHANNEL_ICONS: Record<ActivityChannel, ReactNode> = {
  [ActivityChannel.WHATSAPP_MESSAGE]: <MessageSquare size={10} />,
  [ActivityChannel.CLIENT_CALL]: <Phone size={10} />,
  [ActivityChannel.CLIENT_VISIT]: <MapPin size={10} />,
};

function stepClasses(state: PipelineStepState): string {
  if (state === "done") return "bg-[#E6F7F1] text-[#1D9E75]";
  if (state === "current") return "bg-brand-navy text-white";
  return "bg-[#F0F1F5] text-[#C8CBD8]";
}

interface ChargeTaskPipelineProps {
  channel: ActivityChannel;
  status: ActivityTaskStatus;
}

export function ChargeTaskPipeline({ channel, status }: ChargeTaskPipelineProps) {
  const states = getPipelineStepStates(channel, status);

  return (
    <div className="mt-3 flex items-center gap-0">
      {CHARGE_PIPELINE_CHANNELS.map((pipelineChannel, index) => {
        const state = states[index];
        const isLast = index === CHARGE_PIPELINE_CHANNELS.length - 1;

        return (
          <div key={pipelineChannel} className="flex items-center">
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-all ${stepClasses(state)}`}
            >
              {state === "done" ? (
                <CheckCircle2 size={10} />
              ) : (
                <span className="opacity-80">
                  {CHANNEL_ICONS[pipelineChannel]}
                </span>
              )}
              {getChannelShortLabel(pipelineChannel)}
            </div>
            {!isLast && (
              <div className="mx-0.5 flex items-center">
                <div
                  className={`h-px w-3 ${state === "done" ? "bg-[#1D9E75]" : "bg-border"}`}
                />
                <ChevronRight
                  size={8}
                  className={
                    state === "done" ? "text-[#1D9E75]" : "text-[#D8D9E0]"
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
