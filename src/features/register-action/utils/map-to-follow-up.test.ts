import {
  buildPreventiveFollowUpPayload,
  mapPreventiveChannelToStatus,
  mapPreventiveOutcomeToExpectedResult,
} from "@/features/register-action/utils/map-to-follow-up";
import {
  FollowUpExpectedResult,
  FollowUpStatus,
} from "@/services/followup/followup.types";

describe("mapPreventiveChannelToStatus", () => {
  it("maps channels to follow-up statuses", () => {
    expect(mapPreventiveChannelToStatus("whatsapp")).toBe(
      FollowUpStatus.WHATSAPP_MESSAGE,
    );
    expect(mapPreventiveChannelToStatus("phone")).toBe(
      FollowUpStatus.CLIENT_CALL,
    );
    expect(mapPreventiveChannelToStatus("visit")).toBe(
      FollowUpStatus.CLIENT_VISIT,
    );
  });
});

describe("mapPreventiveOutcomeToExpectedResult", () => {
  it("maps known outcomes and ignores unknown", () => {
    expect(mapPreventiveOutcomeToExpectedResult("confirmed")).toBe(
      FollowUpExpectedResult.WILL_PAY_ON_DATE,
    );
    expect(mapPreventiveOutcomeToExpectedResult("no_return")).toBe(
      FollowUpExpectedResult.NO_RETURN,
    );
    expect(mapPreventiveOutcomeToExpectedResult("delay")).toBe(
      FollowUpExpectedResult.REQUESTED_EXTENSION,
    );
    expect(mapPreventiveOutcomeToExpectedResult("renegotiate")).toBe(
      FollowUpExpectedResult.WANTS_RENEGOTIATION,
    );
    expect(mapPreventiveOutcomeToExpectedResult("other")).toBeUndefined();
  });
});

describe("buildPreventiveFollowUpPayload", () => {
  it("builds payload and includes visit coordinates", () => {
    expect(
      buildPreventiveFollowUpPayload({
        contractId: "c-1",
        installmentNumber: 2,
        channel: "visit",
        outcome: "confirmed",
        note: "Ok",
        latitude: -23.5,
        longitude: -46.6,
      }),
    ).toEqual({
      contractId: "c-1",
      installmentNumber: 2,
      status: FollowUpStatus.CLIENT_VISIT,
      note: "Ok",
      expectedResult: FollowUpExpectedResult.WILL_PAY_ON_DATE,
      latitude: -23.5,
      longitude: -46.6,
    });
  });

  it("omits coordinates for non-visit channels", () => {
    const payload = buildPreventiveFollowUpPayload({
      contractId: "c-1",
      installmentNumber: 1,
      channel: "whatsapp",
      outcome: "no_return",
      latitude: -23.5,
      longitude: -46.6,
    });

    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
    expect(payload.status).toBe(FollowUpStatus.WHATSAPP_MESSAGE);
  });
});
