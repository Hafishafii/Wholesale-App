import { useState, useEffect } from "react";
import { useAdminProducts, ProductGrid } from "../../features/admin/Product";
import AdminLayout from "../../components/layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import axios from "axios";

export interface ProductFilterParams {
  category?: number;
  size?: string;
  fabric?: string;
  price_range?: string;
  availability?: "in_stock" | "out_of_stock";
  allow_customization?: boolean;
  bestSellers?: boolean;
}

const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gray-300 rounded animate-pulse ${className}`}></div>
);

const ProductListPage = () => {
  const [filters, setFilters] = useState<ProductFilterParams>({});
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const navigate = useNavigate();

  const { products, pageLoading, page, next, previous, setPage, reset } =
    useAdminProducts({ filters, search });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "https://ktr-export-backend.onrender.com/api";
        const res = await axios.get(`${API_BASE}/categories/`);
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key: keyof ProductFilterParams, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value === "" ? undefined : value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
    reset();
  };

  // Pagination UI
  const Pagination = () => {
    if (!next && !previous && page === 1) return null;

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          disabled={!previous || pageLoading}
          onClick={() => previous && setPage(page - 1)}
        >
          Prev
        </Button>

        {/* Always show current page */}
        <Button variant="default" disabled>{page}</Button>

        <Button
          variant="outline"
          disabled={!next || pageLoading}
          onClick={() => next && setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-white min-h-screen">
        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <input
              type="text"
              placeholder="Search Products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 border rounded-md px-4 py-2"
            />
            <Button
              onClick={() => navigate("/admin/add-product")}
              className="whitespace-nowrap"
            >
              + Add Product
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
            <select
              value={filters.category ?? ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="border rounded-md px-3 py-2 min-w-[120px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={filters.size ?? ""}
              onChange={(e) => handleFilterChange("size", e.target.value)}
              className="border rounded-md px-3 py-2 min-w-[120px]"
            >
              <option value="">All Sizes</option>
              <option value="freesize">Free Size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <input
              type="text"
              placeholder="Fabric (e.g. cotton oxford)"
              value={filters.fabric ?? ""}
              onChange={(e) => handleFilterChange("fabric", e.target.value)}
              className="border rounded-md px-3 py-2 min-w-[150px]"
            />

            <select
              value={filters.availability ?? ""}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
              className="border rounded-md px-3 py-2 min-w-[120px]"
            >
              <option value="">All Availability</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={filters.allow_customization?.toString() ?? ""}
              onChange={(e) => handleFilterChange("allow_customization", e.target.value === "true")}
              className="border rounded-md px-3 py-2 min-w-[150px]"
            >
              <option value="">Customization (All)</option>
              <option value="true">Allow Customization</option>
              <option value="false">No Customization</option>
            </select>

            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Products */}
        {pageLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonBox key={i} className="h-64" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No products found</p>
            <Button onClick={() => navigate("/admin/add-product")} className="mt-4">
              Add Your First Product
            </Button>
          </div>
        ) : (
          <>
            <ProductGrid products={products} />
            <Pagination />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductListPage;
