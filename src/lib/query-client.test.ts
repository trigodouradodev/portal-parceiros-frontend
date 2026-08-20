import { queryClient, resetQueryCache } from "@/lib/query-client";

describe("resetQueryCache", () => {
  it("drops cached queries so the next session starts empty", () => {
    queryClient.setQueryData(["activities"], { from: "user-a" });
    expect(queryClient.getQueryData(["activities"])).toEqual({
      from: "user-a",
    });

    resetQueryCache();

    expect(queryClient.getQueryData(["activities"])).toBeUndefined();
  });
});
