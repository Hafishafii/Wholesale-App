import { useState, useEffect, useCallback } from "react";
import { useAdminProducts, ProductGrid } from "../../features/admin/Product";
import AdminLayout from "../../components/layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import axios from "axios";

// Define allowed filter params
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

const Spinner = () => (
  <div className="flex justify-center items-center h-64">
    <svg
      className="animate-spin h-8 w-8 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  </div>
);

const ProductListPage = () => {
  const [filters, setFilters] = useState<ProductFilterParams>({});
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  const navigate = useNavigate();

  const { products, loading, total, loadMore, hasMore, reset } =
    useAdminProducts({ filters, search });

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 200;

    if (scrollPosition >= threshold) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_URL ||
          "https://ktr-export-backend.onrender.com/api";
        const res = await axios.get(`${API_BASE}/categories/`);
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Update filters dynamically
  const handleFilterChange = (
    key: keyof ProductFilterParams,
    value: string | boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  // Clear all filters + search
  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
    reset();
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-white min-h-screen">
        {/* Search & Filter UI */}
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

          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <select
              value={filters.category ?? ""}
              onChange={(e) =>
                handleFilterChange("category", e.target.value)
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Size Filter */}
            <select
              value={filters.size ?? ""}
              onChange={(e) => handleFilterChange("size", e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">All Sizes</option>
              <option value="freesize">Free Size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            {/* Fabric Filter */}
            <input
              type="text"
              placeholder="Fabric (e.g. cotton oxford)"
              value={filters.fabric ?? ""}
              onChange={(e) => handleFilterChange("fabric", e.target.value)}
              className="border rounded-md px-3 py-2"
            />

            {/* Availability Filter */}
            <select
              value={filters.availability ?? ""}
              onChange={(e) =>
                handleFilterChange("availability", e.target.value)
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="">All Availability</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* Customization Filter */}
            <select
              value={filters.allow_customization?.toString() ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "allow_customization",
                  e.target.value === "true"
                )
              }
              className="border rounded-md px-3 py-2"
            >
              <option value="">Customization (All)</option>
              <option value="true">Allow Customization</option>
              <option value="false">No Customization</option>
            </select>

            {/* Clear Button */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {loading && products.length === 0 ? (
          <Spinner />
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Manage Products (
              {loading && products.length === 0 ? (
                <SkeletonBox className="inline-block w-12 h-6" />
              ) : (
                total
              )}
              )
            </h2>

            {products.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No products found</p>
                <Button
                  onClick={() => navigate("/admin/add-product")}
                  className="mt-4"
                >
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {loading && products.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="border rounded p-4 space-y-4 animate-pulse"
                      >
                        <SkeletonBox className="w-full h-40 rounded" />
                        <SkeletonBox className="w-3/4 h-6 rounded" />
                        <SkeletonBox className="w-1/2 h-6 rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {!hasMore && (
                  <p className="text-center text-gray-500 mt-6">
                    No more products
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductListPage;
