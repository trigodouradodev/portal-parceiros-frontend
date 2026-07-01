/** Espelha portal-parceiros-backend/src/activities/enums/activity.enums.ts */

export const ActivityInteractionResult = {
  WILL_PAY_ON_DATE: "will_pay_on_date",
  REQUESTED_EXTENSION: "requested_extension",
  WANTS_RENEGOTIATION: "wants_renegotiation",
  PAYMENT_PROMISE: "payment_promise",
  NO_RETURN: "no_return",
} as const;

export type ActivityInteractionResult =
  (typeof ActivityInteractionResult)[keyof typeof ActivityInteractionResult];

export interface InteractionGeolocation {
  latitude: number;
  longitude: number;
}

export interface RegisterInteractionPayload {
  result: ActivityInteractionResult;
  observation?: string;
  promiseDate?: string;
  latitude?: number;
  longitude?: number;
}

export interface ActivityInteractionResponse {
  id: string;
  taskId: string;
  installmentId: string;
  contractId: string;
  channel: string;
  result: string;
  promiseDate?: string;
  observation?: string;
  userId: string;
  createdAt: string;
  geolocation?: InteractionGeolocation;
}

export interface CreatedTaskResponse {
  id: string;
  installmentId: string;
  contractId: string;
  stageCode: string;
  channel: string;
  status: string;
  createdAt: string;
}

export interface RegisterInteractionResponse {
  interaction: ActivityInteractionResponse;
  nextTask: CreatedTaskResponse | null;
}

export interface RegisterInteractionVariables {
  taskId: string;
  payload: RegisterInteractionPayload;
  contractId: string;
  installmentNumber: number;
}
