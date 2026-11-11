import { collectionToday, getOutcomeDateKind } from "./outcome-date";
import { ActivityInteractionResult } from "@/services/activities/activity.enums";

it("usa a data civil de São Paulo na virada UTC", () => {
  expect(collectionToday(new Date("2026-11-06T02:59:59Z"))).toEqual(
    new Date(2026, 10, 5),
  );
  expect(collectionToday(new Date("2026-11-06T03:00:00Z"))).toEqual(
    new Date(2026, 10, 6),
  );
});

it("só promessa e renegociação exigem escolha de data", () => {
  expect(getOutcomeDateKind(ActivityInteractionResult.PAYMENT_PROMISE)).toBe(
    "promise",
  );
  expect(getOutcomeDateKind(ActivityInteractionResult.RENEGOTIATION)).toBe(
    "agreement",
  );
  expect(getOutcomeDateKind(ActivityInteractionResult.DISPUTE)).toBeUndefined();
});
