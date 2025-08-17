import type { ProductFormData } from "../../Product/types";
import ProductCard from "./ProductCard";

interface Props {
  products: ProductFormData[];
}

const ProductGrid = ({ products }: Props) => {
  if (!products || products.length === 0) {
    return (
      <p className="col-span-full text-center text-gray-500">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
