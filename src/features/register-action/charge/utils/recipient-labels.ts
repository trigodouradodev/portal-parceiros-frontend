import { ActivityRecipientType } from "@/services/activities/activity.enums";

export function getRecipientAddressLabel(
  recipientType: ActivityRecipientType,
): string {
  if (recipientType === ActivityRecipientType.GUARANTOR) {
    return "Endereço do avalista";
  }
  return "Endereço do cliente";
}

export function getRecipientPhoneLabel(
  recipientType: ActivityRecipientType,
): string {
  if (recipientType === ActivityRecipientType.GUARANTOR) {
    return "Telefone do avalista";
  }
  return "Telefone cadastrado";
}
