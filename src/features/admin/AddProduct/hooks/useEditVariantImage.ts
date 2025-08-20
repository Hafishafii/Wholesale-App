import { useState } from "react";
import api from "../../../../lib/api";

export const useEditVariantImage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editVariantImage = async (
    imageId: number,
    imageFile: File,
    viewType = "front",
    variantId?: number
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("view_type", viewType);

      let res;
      if (imageId) {
        // Update existing image
        res = await api.patch(`/product-images/${imageId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create new image
        if (!variantId) throw new Error("Variant ID required for new image");
        formData.append("variant", String(variantId));

        res = await api.post(`/product-images/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error("Variant image edit error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to edit variant image");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVariantImage = async (imageId: number) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.delete(`/product-images/${imageId}/`);
      setSuccess(true);
    } catch (err: any) {
      console.error("Delete variant image error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to delete variant image");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { editVariantImage, deleteVariantImage, isLoading, error, setError, success };
};
