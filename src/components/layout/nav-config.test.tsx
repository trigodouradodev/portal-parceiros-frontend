import { describe, expect, it } from "vitest";
import { getNavItemsForPermissions } from "@/components/layout/nav-config";

describe("getNavItemsForPermissions", () => {
  it("hides Carteira when the collection agent permission is present", () => {
    const items = getNavItemsForPermissions(["ROLE_COLLECTION_AGENT"]);

    expect(items.map((item) => item.key)).not.toContain("carteira");
  });

  it("keeps Carteira visible without the collection agent permission", () => {
    const items = getNavItemsForPermissions(["SOME_OTHER_PERMISSION"]);

    expect(items.map((item) => item.key)).toContain("carteira");
  });

  it("keeps Carteira visible when permissions are missing", () => {
    const items = getNavItemsForPermissions();

    expect(items.map((item) => item.key)).toContain("carteira");
  });

  it("shows Originação only with the rollout permission", () => {
    expect(
      getNavItemsForPermissions(["QUOTE_NEW_ORIGINATION_FLOW"]).map(
        (item) => item.key,
      ),
    ).toContain("originacao");
    expect(getNavItemsForPermissions([]).map((item) => item.key)).not.toContain(
      "originacao",
    );
  });
});

describe("Desempenho rollout", () => {
  it.each(
    [
      undefined,
      [],
      ["ROLE_MANAGER"],
      ["ROLE_ADMIN"],
      ["QUOTE_ACTIVITY_GATES"],
      ["ROLE_CONSULTANT"],
      ["ROLE_COLLECTION_AGENT"],
    ].map((permissions) => ({ permissions })),
  )(
    "hides Desempenho without its explicit permission: $permissions",
    ({ permissions }) => {
      expect(
        getNavItemsForPermissions(permissions).map((item) => item.key),
      ).not.toContain("desempenho");
    },
  );
  it.each([
    "ROLE_MANAGER",
    "ROLE_CONSULTANT",
    "ROLE_COLLECTION_AGENT",
    "ROLE_ADMIN",
  ])("shows Desempenho for %s when granted PERFORMANCE_VIEW", (role) => {
    expect(
      getNavItemsForPermissions([role, "PERFORMANCE_VIEW"]).map(
        (item) => item.key,
      ),
    ).toContain("desempenho");
  });
});
