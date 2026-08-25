import {
  buildPreventiveFollowUpPayload,
  mapPreventiveChannelToType,
  mapPreventiveOutcomeToExpectedResult,
} from "@/features/register-action/utils/map-to-follow-up";
import { getPreventiveOutcomes } from "@/features/register-action/preventive/constants/outcomes";
import {
  FollowUpExpectedResult,
  FollowUpParty,
  FollowUpType,
} from "@/services/followup/followup.types";

describe("mapPreventiveChannelToType", () => {
  it("maps channels to structured follow-up types", () => {
    expect(mapPreventiveChannelToType("whatsapp")).toBe(FollowUpType.MESSAGE);
    expect(mapPreventiveChannelToType("phone")).toBe(FollowUpType.CALL);
    expect(mapPreventiveChannelToType("visit")).toBe(FollowUpType.VISIT);
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
    expect(mapPreventiveOutcomeToExpectedResult("dispute")).toBe(
      FollowUpExpectedResult.DISPUTE,
    );
    expect(mapPreventiveOutcomeToExpectedResult("deceased")).toBe(
      FollowUpExpectedResult.DECEASED,
    );
    expect(mapPreventiveOutcomeToExpectedResult("no_forecast")).toBe(
      FollowUpExpectedResult.NO_FORECAST,
    );
    expect(mapPreventiveOutcomeToExpectedResult("not_located")).toBe(
      FollowUpExpectedResult.NOT_LOCATED,
    );
    expect(mapPreventiveOutcomeToExpectedResult("other")).toBe(
      FollowUpExpectedResult.OTHER,
    );
    expect(mapPreventiveOutcomeToExpectedResult()).toBeUndefined();
  });
});

describe("buildPreventiveFollowUpPayload", () => {
  it("builds payload and includes visit coordinates", () => {
    expect(
      buildPreventiveFollowUpPayload({
        contractId: "c-1",
        installmentNumber: 2,
        channel: "visit",
        party: FollowUpParty.GUARANTOR,
        outcome: "confirmed",
        note: "Ok",
        paymentForecast: "2026-09-01",
        latitude: -23.5,
        longitude: -46.6,
      }),
    ).toEqual({
      contractId: "c-1",
      installmentNumber: 2,
      followUpType: FollowUpType.VISIT,
      party: FollowUpParty.GUARANTOR,
      note: "Ok",
      expectedResult: FollowUpExpectedResult.WILL_PAY_ON_DATE,
      paymentForecast: "2026-09-01",
      latitude: -23.5,
      longitude: -46.6,
    });
  });

  it("omits coordinates for non-visit channels", () => {
    const payload = buildPreventiveFollowUpPayload({
      contractId: "c-1",
      installmentNumber: 1,
      channel: "whatsapp",
      party: FollowUpParty.CLIENT,
      outcome: "no_return",
      latitude: -23.5,
      longitude: -46.6,
    });

    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
    expect(payload.followUpType).toBe(FollowUpType.MESSAGE);
    expect(payload.party).toBe(FollowUpParty.CLIENT);
  });
});

describe("getPreventiveOutcomes", () => {
  it("exibe não localizado apenas para visitas", () => {
    expect(
      getPreventiveOutcomes("phone").map((option) => option.value),
    ).not.toContain("not_located");
    expect(
      getPreventiveOutcomes("visit").map((option) => option.value),
    ).toContain("not_located");
    expect(
      getPreventiveOutcomes("whatsapp").map((option) => option.value),
    ).toContain("no_forecast");
  });
});
