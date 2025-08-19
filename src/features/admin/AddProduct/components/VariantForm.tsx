import { useState } from "react";
import type { ProductVariant } from "../types";

interface VariantFormProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const COLOR_OPTIONS = [
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Green", value: "green", hex: "#22c55e" },
  { name: "Yellow", value: "yellow", hex: "#eab308" },
  { name: "Black", value: "black", hex: "#000000" },
  { name: "White", value: "white", hex: "#f9fafb", border: true },
];

const SIZE_OPTIONS = ["small", "medium", "large", "xxl", "xxxl"];

const generateRandomCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const emptyVariant: ProductVariant = {
  color: "",
  product_code: `PC-${generateRandomCode()}`,
  stock_keeping_unit: `SKU-${generateRandomCode()}`,
  cost_price: undefined,
  wholesale_price: undefined,
  min_order_quantity: undefined,
  allow_customization: false,
  images: [],
  sizes: [],
};

export default function VariantForm({
  variants,
  onVariantsChange,
}: VariantFormProps) {
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants);

  const handleChange = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], [field]: value };
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const addVariant = () => {
    const updated = [...localVariants, { ...emptyVariant }];
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const removeVariant = (index: number) => {
    const updated = localVariants.filter((_, i) => i !== index);
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const handleImageChange = (index: number, files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const updated = [...localVariants];
    updated[index].images = [...(updated[index].images || []), ...newFiles];
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const removeVariantImage = (variantIndex: number, imgIndex: number) => {
    const updated = [...localVariants];
    updated[variantIndex].images = updated[variantIndex].images.filter(
      (_, i) => i !== imgIndex
    );
    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-lg font-semibold">Product Details (Add Variants)</h2>
      <p className="text-sm text-gray-600">
        Add one or more variants for this product. Each variant can have its own
        color, size, code, price, stock, and images.
      </p>

      {localVariants.map((variant, index) => (
        <div key={index} className="bg-gray-100 border p-4 rounded-md space-y-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Color Picker */}
            <div>
              <label className="block mb-2">Color</label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map(({ name, value, hex, border }) => (
                  <label
                    key={value}
                    className="flex items-center cursor-pointer"
                    title={name}
                  >
                    <input
                      type="radio"
                      name={`variant-color-${index}`}
                      value={value}
                      checked={variant.color === value}
                      onChange={(e) =>
                        handleChange(index, "color", e.target.value)
                      }
                      className="hidden"
                    />
                    <span
                      className={`w-8 h-8 rounded-full border ${
                        border ? "border-gray-300" : "border-transparent"
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {variant.color === value && (
                        <span className="block w-full h-full rounded-full ring-2 ring-offset-1 ring-indigo-500"></span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="col-span-2">
              <label className="block mb-2">Sizes & Stock</label>
              {variant.sizes.map((s, sIndex) => (
                <div key={sIndex} className="flex items-center gap-2 mb-2">
                  <select
                    value={s.size}
                    onChange={(e) => {
                      const updated = [...variant.sizes];
                      updated[sIndex].size = e.target.value;
                      handleChange(index, "sizes", updated);
                    }}
                    className="border p-2 rounded"
                  >
                    <option value="">Select Size</option>
                    {SIZE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Stock"
                    value={s.current_stock}
                    onChange={(e) => {
                      const updated = [...variant.sizes];
                      updated[sIndex].current_stock = Number(e.target.value);
                      handleChange(index, "sizes", updated);
                    }}
                    className="border p-2 rounded w-32"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const updated = variant.sizes.filter(
                        (_, i) => i !== sIndex
                      );
                      handleChange(index, "sizes", updated);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  handleChange(index, "sizes", [
                    ...variant.sizes,
                    { size: "", current_stock: 0 },
                  ])
                }
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Add Size
              </button>
            </div>

            {/* Product Code */}
            <label>
              Product Code
              <input
                type="text"
                placeholder="Product Code"
                value={variant.product_code}
                onChange={(e) =>
                  handleChange(index, "product_code", e.target.value)
                }
                className="border rounded p-2 w-full"
              />
            </label>

            {/* SKU */}
            <label>
              SKU
              <input
                type="text"
                placeholder="SKU"
                value={variant.stock_keeping_unit}
                onChange={(e) =>
                  handleChange(index, "stock_keeping_unit", e.target.value)
                }
                className="border rounded p-2 w-full"
              />
            </label>

            {/* Cost Price */}
            <label>
              Cost Price
              <input
                type="number"
                placeholder="Cost Price"
                value={variant.cost_price ?? ""}
                onChange={(e) =>
                  handleChange(
                    index,
                    "cost_price",
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                className="border rounded p-2 w-full"
              />
            </label>

            {/* Wholesale Price */}
            <label>
              Wholesale Price
              <input
                type="number"
                placeholder="Wholesale Price"
                value={variant.wholesale_price ?? ""}
                onChange={(e) =>
                  handleChange(
                    index,
                    "wholesale_price",
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                className="border rounded p-2 w-full"
              />
            </label>

            {/* Min Order Quantity */}
            <label>
              Min Order Quantity
              <input
                type="number"
                placeholder="Min Order Qty"
                value={variant.min_order_quantity ?? ""}
                onChange={(e) =>
                  handleChange(
                    index,
                    "min_order_quantity",
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                className="border rounded p-2 w-full"
              />
            </label>

            {/* Allow Customization */}
            <label className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={variant.allow_customization}
                onChange={(e) =>
                  handleChange(index, "allow_customization", e.target.checked)
                }
              />
              Allow Customization
            </label>

            {/* Variant Images */}
            <div className="col-span-2">
              <label className="block mb-2">Variant Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(index, e.target.files)}
                className="hidden"
                id={`variant-file-${index}`}
              />
              <div className="flex flex-wrap gap-4">
                <label
                  htmlFor={`variant-file-${index}`}
                  className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-400 rounded cursor-pointer hover:border-gray-600 transition"
                >
                  <span className="text-2xl text-gray-400">+</span>
                </label>
                {variant.images &&
                  variant.images.map((file, imgIndex) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                      <div key={imgIndex} className="relative w-24 h-24">
                        <img
                          src={previewUrl}
                          alt={`Variant ${index} image ${imgIndex + 1}`}
                          className="w-full h-full object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(index, imgIndex)}
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Remove Variant Button */}
          <button
            type="button"
            onClick={() => removeVariant(index)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Remove Variant
          </button>
        </div>
      ))}

      {/* Add Another Variant */}
      <button
        type="button"
        onClick={addVariant}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Another Variant
      </button>
    </div>
  );
}
