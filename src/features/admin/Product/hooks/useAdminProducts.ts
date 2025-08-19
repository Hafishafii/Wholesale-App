import { useEffect, useState, useCallback } from "react";
import type { ProductFormData } from "../types";
import type { AxiosResponse } from "axios";
import api from "../../../../lib/api";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://ktr-export-backend.onrender.com/api";

interface UseAdminProductsReturn {
  products: ProductFormData[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  reset: () => void;
}

interface ProductFilterParams {
  category?: number;
  size?: string;
  fabric?: string;
  price_range?: string;
  availability?: "in_stock" | "out_of_stock";
  allow_customization?: boolean;
  bestSellers?: boolean;
}

interface UseAdminProductsParams {
  filters: ProductFilterParams;
  search: string;
}

const useAdminProducts = ({
  filters,
  search,
}: UseAdminProductsParams): UseAdminProductsReturn => {
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const totalPages = Math.ceil(total / pageSize);

  const reset = () => {
    setProducts([]);
    setPage(1);
  };

  const fetchProducts = useCallback(
    async (pageNum: number) => {
      setLoading(true);

      try {
        let endpoint = `${API_BASE}/products/`;
        let params: Record<string, any> = {
          page: pageNum,
          page_size: pageSize,
        };

        if (search.trim()) {
          endpoint = `${API_BASE}/products/search/`;
          params.q = search.trim();
        } else if (filters.bestSellers) {
          endpoint = `${API_BASE}/products/best-sellers/`;
        } else if (Object.keys(filters).length > 0) {
          if (filters.category) params.category = filters.category;
          if (filters.size) params.size = filters.size;
          if (filters.fabric) params.fabric = filters.fabric;
          if (filters.price_range) params.price_range = filters.price_range;
          if (filters.availability) params.availability = filters.availability;
          if (filters.allow_customization !== undefined) {
            params.allow_customization = filters.allow_customization;
          }
        }

        const res: AxiosResponse<any> = await api.get(endpoint, { params });

        const newProducts: ProductFormData[] = res.data.results || [];
        const count: number = res.data.count || 0;

        setProducts(newProducts);
        setTotal(count);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, search]
  );

  // fetch whenever page changes
  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  // reset whenever filters/search changes
  useEffect(() => {
    reset();
  }, [filters, search]);

  return {
    products,
    loading,
    total,
    page,
    pageSize,
    totalPages,
    setPage,
    reset,
  };
};

export default useAdminProducts;
