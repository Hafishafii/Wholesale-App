import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import type { ProductFormData } from "../../Product/types";

interface Props {
  product: ProductFormData;
}

const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://ktr-export-backend.onrender.com";

  // Find first variant with images
  const variantWithImages = product.variants.find(
    (v) => v.images && v.images.length > 0
  );


  // Get primary image URL safely
  let primaryImage = "";
  if (variantWithImages?.images?.[0]?.image) {
  primaryImage = variantWithImages.images[0].image.trim();
  } else if (product.category?.image) {
    primaryImage = product.category.image.trim();
  }

  // Construct full image URL
  const fullImageUrl = primaryImage
    ? /^https?:\/\//i.test(primaryImage)
      ? primaryImage
      : `${API_BASE}${primaryImage}`
    : "";

  // Calculate total stock
  const totalStock = product.variants.reduce((sum, v) => {
  return (
        sum +
        v.sizes.reduce((sizeSum, s) => sizeSum + (s.current_stock || 0), 0)
      );
  }, 0);


  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative group">
        <button
          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
          title="Edit Product"
          aria-label="Edit product"
        >
          <Pencil className="w-4 h-4 text-blue-600" />
        </button>

        {fullImageUrl ? (
          <img
            src={fullImageUrl}
            alt={product.name || "Unnamed Product"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-1">
          {product.name || "Unnamed Product"}
        </h3>
        <p className="text-gray-600 text-sm">
          {product.product_type || "N/A"}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">
            Variants: <span className="font-medium">{product.variants.length}</span>
          </p>
          <p className="text-sm">
            Total Stock: <span className="font-medium">{totalStock}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
