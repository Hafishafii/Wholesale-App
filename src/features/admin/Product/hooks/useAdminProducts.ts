import { useEffect, useState, useCallback } from "react";
import type { ProductFormData } from "../types";
import type { AxiosResponse } from "axios";
import api from "../../../../lib/api";

const API_BASE = import.meta.env.VITE_API_URL || "https://ktr-export-backend.onrender.com/api";

interface UseAdminProductsReturn {
  products: ProductFormData[];
  pageLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  next: string | null;
  previous: string | null;
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

const useAdminProducts = ({ filters, search }: UseAdminProductsParams): UseAdminProductsReturn => {
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const pageSize = 12;

  const reset = () => {
    setProducts([]);
    setPage(1);
  };

  const fetchProducts = useCallback(
    async (pageNum: number) => {
      setPageLoading(true);
      try {
        let endpoint = `${API_BASE}/products/`;
        let params: Record<string, any> = { page: pageNum, page_size: pageSize };

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
          if (filters.allow_customization !== undefined) params.allow_customization = filters.allow_customization;
        }

        const res: AxiosResponse<any> = await api.get(endpoint, { params });

        setProducts(res.data.results || []);
        setTotal(res.data.count || 0);
        setNext(res.data.next || null);
        setPrevious(res.data.previous || null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        setNext(null);
        setPrevious(null);
      } finally {
        setPageLoading(false);
      }
    },
    [filters, search]
  );

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  useEffect(() => {
    reset();
  }, [filters, search]);

  return { products, pageLoading, total, page, pageSize, next, previous, setPage, reset };
};

export default useAdminProducts;
