import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionContext } from "@/contexts/action";
import {
  RegisterActionFooter,
  RegisterActionLayout,
  RegisterFormCard,
  RegisterSaveButton,
  useRegisterActionGuard,
} from "@/features/register-action";
import { useToast } from "@/contexts/toast/toast-context";

const PHONE_STATUS_OPTIONS = [
  "Sem retorno",
  "Sem Previsão",
  "Promessa de pagamento",
  "Disputa / Contestação",
  "Renegociação",
  "Outro",
];

const VISIT_STATUS_OPTIONS = [
  "Não localizado",
  "Sem Previsão",
  "Promessa de pagamento",
  "Renegociação",
  "Outro",
];

export function RegisterContactActionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { client, contactType, onComplete, clearActionData } =
    useActionContext();
  const [contactDate, setContactDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [contactTime, setContactTime] = useState(() =>
    new Date().toTimeString().slice(0, 5),
  );
  const [contactStatus, setContactStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const ready = Boolean(client && contactType);

  useRegisterActionGuard({ ready });

  const handleBack = useCallback(() => {
    clearActionData();
    navigate(-1);
  }, [clearActionData, navigate]);

  if (!client || !contactType) {
    return null;
  }

  const isPhone = contactType === "phone";
  const title = isPhone ? "Registrar Ligação" : "Registrar Visita";
  const statusOptions = isPhone ? PHONE_STATUS_OPTIONS : VISIT_STATUS_OPTIONS;

  async function handleSave() {
    if (!contactStatus) {
      showToast("Selecione um status.", { variant: "destructive" });
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    onComplete({
      channel: isPhone ? "phone" : "visit",
      outcome: contactStatus,
      note,
      status: contactStatus,
    });
    showToast("Ação registrada.");
    clearActionData();
    navigate(-1);
    setSaving(false);
  }

  return (
    <RegisterActionLayout
      title={title}
      client={client}
      onBack={handleBack}
      footer={
        <RegisterActionFooter>
          <Button
            variant="outline"
            className="h-12 rounded-2xl px-5"
            onClick={handleBack}
          >
            Cancelar
          </Button>
          <RegisterSaveButton saving={saving} onClick={handleSave} />
        </RegisterActionFooter>
      }
    >
      <RegisterFormCard>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Data</Label>
              <Input
                type="date"
                value={contactDate}
                onChange={(event) => setContactDate(event.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Horário</Label>
              <Input
                type="time"
                value={contactTime}
                onChange={(event) => setContactTime(event.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Status / Resultado</Label>
            <Select value={contactStatus} onValueChange={setContactStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              placeholder={`Descreva como foi a ${isPhone ? "ligação" : "visita"}…`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-1 min-h-[76px]"
            />
          </div>
        </div>
      </RegisterFormCard>
    </RegisterActionLayout>
  );
}
