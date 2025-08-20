import { useState } from "react";
import api from "../../../../lib/api";
import type { ProductFormData } from "../types";

export const useEditProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editProduct = async (id: number, formData: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const productPayload = {
        category_id: Number(formData.category_id),
        name: formData.name?.trim(),
        product_type: formData.product_type,
        description: formData.description,
        fabric: formData.fabric,
        is_draft: formData.is_draft,
      };

      const updateRes = await api.patch(`/products/${id}/`, productPayload);

      setSuccess(true);
      return updateRes.data;
    } catch (err: any) {
      console.error("Edit error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to edit product");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editProduct,
    isLoading,
    error,
    setError,
    success,
  };
};
