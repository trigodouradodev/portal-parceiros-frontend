import { api } from "@/lib/api/axios";
import type { ProductOption } from "./products.types";

export const productsService = {
  /** GET /products */
  async getProducts(): Promise<ProductOption[]> {
    const { data } = await api.get<ProductOption[]>("/products");
    return data;
  },
};
