import { useState } from 'react';
import api from '../../../../lib/api';
import type { ProductFormData } from '../types';

export const useEditProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editProduct = async (id: number, formData: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Prepare payload without variants
      const productPayload = {
        category_id: Number(formData.category_id),
        name: formData.name?.trim(),
        product_type: formData.product_type,
        description: formData.description,
        fabric: formData.fabric,
        is_draft: formData.is_draft,
      };

      // Step 2: Update main product info
      const updateRes = await api.put(`/products/${id}/update/`, productPayload);

      // Step 3: Upload product-level images
      if (formData.images?.length) {
        const productImgFormData = new FormData();
        formData.images.forEach((img) => {
          productImgFormData.append('images', img);
          productImgFormData.append('view_types', 'front');
        });
        await api.post(`/products/${id}/upload_images/`, productImgFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess(true);
      return updateRes.data;
    } catch (err: any) {
      console.error('Edit error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to edit product');
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
