import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Drop cached queries so the next session never reuses another user's data. */
export function resetQueryCache() {
  queryClient.cancelQueries();
  queryClient.clear();
}
