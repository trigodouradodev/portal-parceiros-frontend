import {
  buildV2RegisterInteractionPayload,
  mapContactTypeToInteractionChannel,
  mapTaskChannelToActivityTaskType,
} from "@/features/register-action/utils/map-to-interaction";
import {
  ActivityInteractionChannel,
  ActivityInteractionResult,
  ActivityRecipientType,
  ActivityTaskType,
} from "@/services/activities/activity.enums";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

describe("mapContactTypeToInteractionChannel", () => {
  it("maps preventive contact types", () => {
    expect(mapContactTypeToInteractionChannel("whatsapp")).toBe(
      ActivityInteractionChannel.WHATSAPP,
    );
    expect(mapContactTypeToInteractionChannel("phone")).toBe(
      ActivityInteractionChannel.CALL,
    );
    expect(mapContactTypeToInteractionChannel("visit")).toBe(
      ActivityInteractionChannel.VISIT,
    );
  });

  it("falls back to task channel", () => {
    expect(
      mapContactTypeToInteractionChannel(
        undefined,
        ActivityChannel.WHATSAPP_MESSAGE,
      ),
    ).toBe(ActivityInteractionChannel.WHATSAPP);
    expect(
      mapContactTypeToInteractionChannel(
        undefined,
        ActivityChannel.CLIENT_VISIT,
      ),
    ).toBe(ActivityInteractionChannel.VISIT);
    expect(mapContactTypeToInteractionChannel()).toBe(
      ActivityInteractionChannel.CALL,
    );
  });
});

describe("mapTaskChannelToActivityTaskType", () => {
  it("returns VISIT for visit flows", () => {
    expect(mapTaskChannelToActivityTaskType(undefined, "visit")).toBe(
      ActivityTaskType.VISIT,
    );
    expect(
      mapTaskChannelToActivityTaskType(ActivityChannel.CLIENT_VISIT),
    ).toBe(ActivityTaskType.VISIT);
  });

  it("defaults to CONTACT", () => {
    expect(
      mapTaskChannelToActivityTaskType(ActivityChannel.WHATSAPP_MESSAGE),
    ).toBe(ActivityTaskType.CONTACT);
  });
});

describe("buildV2RegisterInteractionPayload", () => {
  it("builds base payload without optional fields", () => {
    expect(
      buildV2RegisterInteractionPayload({
        result: ActivityInteractionResult.NO_RESPONSE,
        recipientType: ActivityRecipientType.CLIENT,
        contactType: "phone",
        note: "",
      }),
    ).toEqual({
      channel: ActivityInteractionChannel.CALL,
      recipientType: ActivityRecipientType.CLIENT,
      result: ActivityInteractionResult.NO_RESPONSE,
      observation: undefined,
    });
  });

  it("adds promise date and visit coordinates when applicable", () => {
    expect(
      buildV2RegisterInteractionPayload({
        result: ActivityInteractionResult.PAYMENT_PROMISE,
        recipientType: ActivityRecipientType.CLIENT,
        contactType: "visit",
        promiseDate: "2026-04-10",
        latitude: -23.5,
        longitude: -46.6,
        note: "Prometeu",
      }),
    ).toEqual({
      channel: ActivityInteractionChannel.VISIT,
      recipientType: ActivityRecipientType.CLIENT,
      result: ActivityInteractionResult.PAYMENT_PROMISE,
      observation: "Prometeu",
      promiseDate: "2026-04-10T12:00:00.000Z",
      latitude: -23.5,
      longitude: -46.6,
    });
  });
});
