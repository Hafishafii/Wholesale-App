import { useEffect, useState, useCallback } from "react";
import type { ProductFormData } from "../types";
import axios, { type AxiosResponse } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://ktr-export-backend.onrender.com/api";

interface UseAdminProductsReturn {
  products: ProductFormData[];
  loading: boolean;
  total: number;
  page: number;
  loadMore: () => void;
  hasMore: boolean;
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

const useAdminProducts = ({ filters, search }: UseAdminProductsParams): UseAdminProductsReturn => {
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const reset = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  };

  const fetchProducts = useCallback(
    async (pageNum: number) => {
      if (!hasMore && pageNum !== 1) return;

      setLoading(true);
      try {
        let endpoint = `${API_BASE}/products/`;
        let params: Record<string, any> = { page: pageNum, page_size: 12 };

        if (search.trim()) {
          endpoint = `${API_BASE}/products/search/`;
          params.q = search.trim();
        } else if (filters.bestSellers) {
          endpoint = `${API_BASE}/products/best-sellers/`;
        } else if (Object.keys(filters).length > 0) {
          endpoint = `${API_BASE}/products/filter/`;

          if (filters.category) params.category = filters.category;
          if (filters.size) params.size = filters.size;
          if (filters.fabric) params.fabric = filters.fabric;
          if (filters.price_range) params.price_range = filters.price_range;
          if (filters.availability) params.availability = filters.availability;
          if (filters.allow_customization !== undefined) {
            params.allow_customization = filters.allow_customization;
          }
        }

        const token = localStorage.getItem("access_token");
        const res: AxiosResponse<any> = await axios.get(endpoint, {
          params,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const newProducts: ProductFormData[] = res.data.results || [];
        const count: number = res.data.count || 0;
        const nextPageExists: boolean = !!res.data.next;

        if (pageNum === 1) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }

        setTotal(count);
        setHasMore(nextPageExists);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, search, hasMore]
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  useEffect(() => {
    reset();
  }, [filters, search]);

  return { products, loading, total, page, loadMore, hasMore, reset };
};

export default useAdminProducts;
