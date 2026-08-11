import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products/products.service";

export const productsKeys = {
  all: ["products"] as const,
  list: () => [...productsKeys.all, "list"] as const,
};

export function useProducts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productsKeys.list(),
    queryFn: productsService.getProducts,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}
