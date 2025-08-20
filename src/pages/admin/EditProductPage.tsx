import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCategories } from "../../features/admin/AddProduct";
import { useEditProduct } from "../../features/admin/AddProduct/hooks/useEditProduct";
import { useEditVariant } from "../../features/admin/AddProduct/hooks/useEditVariant";
import { useEditVariantImage } from "../../features/admin/AddProduct/hooks/useEditVariantImage";
import { ProductInfoForm } from "../../features/admin/AddProduct";
import api from "../../lib/api";

import type {
  ProductFormData,
  ProductVariant,
  VariantSize,
} from "../../features/admin/AddProduct/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { categories } = useCategories();
  const { editProduct, isLoading, error, success } = useEditProduct();
  const { editVariant, editVariantSize } = useEditVariant();
  const { editVariantImage, deleteVariantImage } = useEditVariantImage();

  const [formData, setFormData] = useState<ProductFormData>({
    category_id: 0,
    name: "",
    product_type: "",
    fabric: "",
    description: "",
    is_draft: false,
    variants: [],
  });

  // Fetch product details
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}/`);
        setFormData({
          category_id: data.category?.id || 0,
          name: data.name,
          product_type: data.product_type,
          fabric: data.fabric,
          description: data.description,
          is_draft: data.is_draft,
          variants: data.variants || [],
        });
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (success) navigate("/admin/products");
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await editProduct(Number(id), formData);
  };

  const handleVariantChange = (
    variantId: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId ? { ...v, [field]: value } : v
      ),
    }));
  };

  // Update size locally & persist
  const handleSizeChange = async (
    variantId: number,
    updatedSize: VariantSize
  ) => {
    // update locally first
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId
          ? {
              ...v,
              sizes: v.sizes.map((s) =>
                s.id === updatedSize.id ? updatedSize : s
              ),
            }
          : v
      ),
    }));

    // persist to backend
    if (updatedSize.id) {
      try {
        const saved = await editVariantSize(updatedSize);
        setFormData((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v.id === variantId
              ? {
                  ...v,
                  sizes: v.sizes.map((s) =>
                    s.id === saved.id ? saved : s
                  ),
                }
              : v
          ),
        }));
      } catch (err) {
        console.error("Failed to save size", err);
      }
    }
  };

  const saveVariant = async (variant: ProductVariant) => {
    if (!variant.id) return;
    try {
      const updated = await editVariant(variant.id, variant);
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v) =>
          v.id === updated.id ? updated : v
        ),
      }));
    } catch (err) {
      console.error("Failed to save variant", err);
    }
  };

  const handleImageUpload = async (
    variantId: number,
    imageId: number,
    file: File
  ) => {
    try {
      let updatedImage;

      if (!imageId) {
        const variant = formData.variants.find((v) => v.id === variantId);
        if (variant && (!variant.images || variant.images.length === 0)) {
          const variantFormData = new FormData();
          variantFormData.append("images", file);
          const { data } = await api.post(
            `/variants/${variantId}/bulk_upload_images/`,
            variantFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          updatedImage = data[0];
        } else {
          updatedImage = await editVariantImage(
            imageId,
            file,
            "front",
            variantId
          );
        }
      } else {
        updatedImage = await editVariantImage(imageId, file, "front", variantId);
      }

      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v) =>
          v.id === variantId
            ? {
                ...v,
                images: imageId
                  ? v.images.map((img) =>
                      img.id === imageId ? { ...img, ...updatedImage } : img
                    )
                  : [...v.images, updatedImage],
              }
            : v
        ),
      }));
    } catch (err) {
      console.error("Failed to upload image", err);
    }
  };

  const handleDeleteImage = async (variantId: number, imageId: number) => {
    try {
      await deleteVariantImage(imageId);
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v) =>
          v.id === variantId
            ? { ...v, images: v.images.filter((img) => img.id !== imageId) }
            : v
        ),
      }));
    } catch (err) {
      console.error("Failed to delete image", err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      {error && (
        <div className="bg-red-200 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Product Info */}
        <ProductInfoForm
          categories={categories}
          formData={formData}
          onInputChange={(e) => {
            const { name, value, type, checked } = e.target as HTMLInputElement;
            setFormData((prev) => ({
              ...prev,
              [name]: type === "checkbox" ? checked : value,
            }));
          }}
        />

        {/* Variants */}
        {formData.variants.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-2">Variants</h2>
            {formData.variants.map((variant, i) => (
              <div key={variant.id || i} className="border p-3 mb-3 rounded">
                {/* Variant fields */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={variant.color || ""}
                    onChange={(e) =>
                      handleVariantChange(variant.id!, "color", e.target.value)
                    }
                    placeholder="Color"
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    value={variant.product_code || ""}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id!,
                        "product_code",
                        e.target.value
                      )
                    }
                    placeholder="Product Code"
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    value={variant.stock_keeping_unit || ""}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id!,
                        "stock_keeping_unit",
                        e.target.value
                      )
                    }
                    placeholder="SKU"
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={variant.cost_price ?? ""}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id!,
                        "cost_price",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Cost Price"
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={variant.wholesale_price ?? ""}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id!,
                        "wholesale_price",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Wholesale Price"
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={variant.min_order_quantity ?? ""}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id!,
                        "min_order_quantity",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Min Order Qty"
                    className="border p-2 rounded"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!variant.allow_customization}
                      onChange={(e) =>
                        handleVariantChange(
                          variant.id!,
                          "allow_customization",
                          e.target.checked
                        )
                      }
                    />
                    <span className="ml-2">Allow Customization</span>
                  </label>
                </div>

                {/* Sizes */}
                {variant.sizes.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium">Sizes & Stock:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {variant.sizes.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-col gap-1 border p-2 rounded"
                        >
                          {/* Editable Size Name */}
                          <input
                            type="text"
                            value={s.size}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                variants: prev.variants.map((v) =>
                                  v.id === variant.id
                                    ? {
                                        ...v,
                                        sizes: v.sizes.map((sz) =>
                                          sz.id === s.id ? { ...sz, size: e.target.value } : sz
                                        ),
                                      }
                                    : v
                                ),
                              }))
                            }
                            onBlur={() =>
                              handleSizeChange(variant.id!, {
                                ...s,
                                size: s.size, 
                              })
                            }
                            className="border p-1 rounded text-sm"
                          />

                          {/* Editable Stock */}
                          <input
                            type="number"
                            value={s.current_stock ?? 0}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                variants: prev.variants.map((v) =>
                                  v.id === variant.id
                                    ? {
                                        ...v,
                                        sizes: v.sizes.map((sz) =>
                                          sz.id === s.id
                                            ? { ...sz, current_stock: Number(e.target.value) }
                                            : sz
                                        ),
                                      }
                                    : v
                                ),
                              }))
                            }
                            onBlur={() =>
                              handleSizeChange(variant.id!, {
                                ...s,
                                current_stock: s.current_stock,
                              })
                            }
                            className="border p-1 rounded text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <button
                  type="button"
                  onClick={() => saveVariant(variant)}
                  className="mt-3 bg-green-500 text-white px-3 py-1 rounded"
                >
                  Save Variant
                </button>

                {/* Images */}
                <div className="mt-4">
                  <p className="font-medium">Images:</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {variant.images.map((img, i) => {
                      if (!img) return null;

                      const src =
                        typeof img.image === "string"
                          ? img.image
                          : URL.createObjectURL(img.image);

                      return (
                        <div
                          key={img.id || i}
                          className="flex flex-col items-center"
                        >
                          <img
                            src={src}
                            alt=""
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files &&
                              handleImageUpload(
                                variant.id!,
                                img.id || 0,
                                e.target.files[0]
                              )
                            }
                            className="mt-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteImage(variant.id!, img.id!)
                            }
                            className="text-red-500 text-xs mt-1"
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Always show upload input for new image */}
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files &&
                        handleImageUpload(variant.id!, 0, e.target.files[0])
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLoading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
