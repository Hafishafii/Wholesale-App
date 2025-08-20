import api from "../../../../lib/api";
import type { ProductVariant, VariantSize } from "../types";

export const useEditVariant = () => {
  const editVariant = async (id: number, variant: ProductVariant) => {
    try {
      const payload = {
        color: variant.color,
        product_code: variant.product_code,
        stock_keeping_unit: variant.stock_keeping_unit,
        cost_price: variant.cost_price,
        wholesale_price: variant.wholesale_price,
        min_order_quantity: variant.min_order_quantity,
        allow_customization: variant.allow_customization,
      };

      const res = await api.patch(`/variants/${id}/`, payload);
      return res.data;
    } catch (err: any) {
      console.error("Variant edit error:", err.response?.data || err.message);
      throw err;
    }
  };

  const editVariantSize = async (size: VariantSize) => {
    try {
      if (!size.size || size.size.trim() === "") {
        throw new Error("Size name cannot be blank");
      }

      const payload = {
        size: size.size.trim(),
        current_stock: size.current_stock,
      };

      console.log("PATCH size payload:", payload);

      const res = await api.patch(`/sizes/${size.id}/`, payload);
      return res.data;
    } catch (err: any) {
      console.error("Size edit error:", err.response?.data || err.message);
      throw err;
    }
  };

  return { editVariant, editVariantSize };
};
