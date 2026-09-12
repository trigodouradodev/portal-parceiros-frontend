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
});
