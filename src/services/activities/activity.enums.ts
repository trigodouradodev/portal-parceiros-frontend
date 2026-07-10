/**
 * Espelha portal-parceiros-backend/src/activities/enums/activity.enums.ts
 * e os enums documentados em cobranca-v2-frontend-integracao.md.
 */

export const ActivityTaskType = {
  CONTACT: "contact",
  VISIT: "visit",
} as const;

export type ActivityTaskType =
  (typeof ActivityTaskType)[keyof typeof ActivityTaskType];

/** Canal real da interação (POST /interactions). */
export const ActivityInteractionChannel = {
  WHATSAPP: "whatsapp",
  CALL: "call",
  VISIT: "visit",
} as const;

export type ActivityInteractionChannel =
  (typeof ActivityInteractionChannel)[keyof typeof ActivityInteractionChannel];

export const ActivityTaskStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  SYSTEM_CLOSED: "system_closed",
  CANCELLED: "cancelled",
} as const;

export type ActivityTaskStatus =
  (typeof ActivityTaskStatus)[keyof typeof ActivityTaskStatus];

export const ActivityRecipientType = {
  CLIENT: "client",
  GUARANTOR: "guarantor",
  OTHER: "other",
} as const;

export type ActivityRecipientType =
  (typeof ActivityRecipientType)[keyof typeof ActivityRecipientType];

export const ActivityInteractionResult = {
  NO_RESPONSE: "no_response",
  NOT_LOCATED: "not_located",
  PAYMENT_PROMISE: "payment_promise",
  DISPUTE: "dispute",
  RENEGOTIATION: "renegotiation",
  DECEASED: "deceased",
  NO_FORECAST: "no_forecast",
  OTHER: "other",
} as const;

export type ActivityInteractionResult =
  (typeof ActivityInteractionResult)[keyof typeof ActivityInteractionResult];

export const QueueTone = {
  FRIENDLY: "friendly",
  FIRM: "firm",
  SEVERE: "severe",
} as const;

export type QueueTone = (typeof QueueTone)[keyof typeof QueueTone];

/** segmentCode retornado pela API (`GET /activities/tasks/today`). */
export const QueueSegmentCode = {
  RECENT: "recent",
  BROKEN_PROMISE: "broken_promise",
  FPD: "fpd",
  EARLY: "early",
  MID: "mid",
  POST_LETTER: "post_letter",
  PRE_DEFAULT: "pre_default",
} as const;

export type QueueSegmentCode =
  (typeof QueueSegmentCode)[keyof typeof QueueSegmentCode];

export const CHANNELS_BY_TASK_TYPE: Record<
  ActivityTaskType,
  ActivityInteractionChannel[]
> = {
  [ActivityTaskType.CONTACT]: [
    ActivityInteractionChannel.WHATSAPP,
    ActivityInteractionChannel.CALL,
  ],
  [ActivityTaskType.VISIT]: [ActivityInteractionChannel.VISIT],
};

export const RESULTS_BY_TASK_TYPE: Record<
  ActivityTaskType,
  ActivityInteractionResult[]
> = {
  [ActivityTaskType.CONTACT]: [
    ActivityInteractionResult.NO_RESPONSE,
    ActivityInteractionResult.PAYMENT_PROMISE,
    ActivityInteractionResult.DISPUTE,
    ActivityInteractionResult.RENEGOTIATION,
    ActivityInteractionResult.DECEASED,
    ActivityInteractionResult.NO_FORECAST,
    ActivityInteractionResult.OTHER,
  ],
  [ActivityTaskType.VISIT]: [
    ActivityInteractionResult.NOT_LOCATED,
    ActivityInteractionResult.PAYMENT_PROMISE,
    ActivityInteractionResult.DISPUTE,
    ActivityInteractionResult.RENEGOTIATION,
    ActivityInteractionResult.DECEASED,
    ActivityInteractionResult.NO_FORECAST,
    ActivityInteractionResult.OTHER,
  ],
};

export const RESCHEDULE_MIN_DAYS = 1;
export const RESCHEDULE_MAX_DAYS = 5;
export const PROMISE_MAX_DAYS = 10;

const QUEUE_TONE_VALUES = new Set<string>(Object.values(QueueTone));
const QUEUE_TASK_TYPE_VALUES = new Set<string>(Object.values(ActivityTaskType));
const QUEUE_TASK_STATUS_VALUES = new Set<string>(
  Object.values(ActivityTaskStatus),
);
const QUEUE_SEGMENT_CODE_VALUES = new Set<string>(
  Object.values(QueueSegmentCode),
);
const INTERACTION_CHANNEL_VALUES = new Set<string>(
  Object.values(ActivityInteractionChannel),
);
const RECIPIENT_TYPE_VALUES = new Set<string>(
  Object.values(ActivityRecipientType),
);
const INTERACTION_RESULT_VALUES = new Set<string>(
  Object.values(ActivityInteractionResult),
);

export function parseQueueTone(value: string): QueueTone {
  return QUEUE_TONE_VALUES.has(value)
    ? (value as QueueTone)
    : QueueTone.FRIENDLY;
}

export function parseActivityTaskType(value: string): ActivityTaskType {
  return QUEUE_TASK_TYPE_VALUES.has(value)
    ? (value as ActivityTaskType)
    : ActivityTaskType.CONTACT;
}

export function parseActivityTaskStatus(value: string): ActivityTaskStatus {
  return QUEUE_TASK_STATUS_VALUES.has(value)
    ? (value as ActivityTaskStatus)
    : ActivityTaskStatus.PENDING;
}

export function parseQueueSegmentCode(value: string): QueueSegmentCode {
  return QUEUE_SEGMENT_CODE_VALUES.has(value)
    ? (value as QueueSegmentCode)
    : QueueSegmentCode.MID;
}

export function parseActivityInteractionChannel(
  value: string,
): ActivityInteractionChannel {
  return INTERACTION_CHANNEL_VALUES.has(value)
    ? (value as ActivityInteractionChannel)
    : ActivityInteractionChannel.CALL;
}

export function parseActivityRecipientType(
  value: string,
): ActivityRecipientType {
  return RECIPIENT_TYPE_VALUES.has(value)
    ? (value as ActivityRecipientType)
    : ActivityRecipientType.CLIENT;
}

export function parseActivityInteractionResult(
  value: string,
): ActivityInteractionResult {
  return INTERACTION_RESULT_VALUES.has(value)
    ? (value as ActivityInteractionResult)
    : ActivityInteractionResult.OTHER;
}
