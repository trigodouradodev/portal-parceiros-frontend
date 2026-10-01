/* eslint-disable react-refresh/only-export-components */
import {
  CreditCard,
  Eye,
  EyeOff,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { toSelectOptions } from "@/components/ui/select-option";
import {
  CHILDREN_COUNT_OPTIONS,
  CREDIT_PURPOSE_OPTIONS,
  DEBT_CREDITOR_OPTIONS,
  GENDER_OPTIONS,
  HOUSEHOLD_SIZE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  RESIDENCE_TIME_OPTIONS,
} from "@/features/originacao/data/proposal";

export const USER_ICON = <User size={16} />;
export const CREDIT_CARD_ICON = <CreditCard size={16} />;
export const ID_CARD_ICON = <IdCard size={16} />;
export const MAIL_ICON = <Mail size={16} />;
export const PHONE_ICON = <Phone size={16} />;
export const EYE_ICON = <Eye size={13} />;
export const EYE_OFF_ICON = <EyeOff size={13} />;

/** Options já vêm como `{ value, label }` com código estável. */
export const GENDER_SELECT_OPTIONS = GENDER_OPTIONS;
export const MARITAL_STATUS_SELECT_OPTIONS = MARITAL_STATUS_OPTIONS;
export const PROPERTY_STATUS_SELECT_OPTIONS = PROPERTY_STATUS_OPTIONS;
export const RESIDENCE_TIME_SELECT_OPTIONS = RESIDENCE_TIME_OPTIONS;
export const CHILDREN_COUNT_SELECT_OPTIONS = CHILDREN_COUNT_OPTIONS;
export const HOUSEHOLD_SIZE_SELECT_OPTIONS = HOUSEHOLD_SIZE_OPTIONS;
export const CREDIT_PURPOSE_SELECT_OPTIONS = CREDIT_PURPOSE_OPTIONS;
export const DEBT_CREDITOR_SELECT_OPTIONS = toSelectOptions(
  DEBT_CREDITOR_OPTIONS,
);
