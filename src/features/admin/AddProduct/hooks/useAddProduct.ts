import { useState } from 'react';
import api from '../../../../lib/api';
import type { ProductFormData } from '../types';

export const useAddProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addProduct = async (formData: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const productPayload = {
        category_id: formData.category_id,
        name: formData.name,
        product_type: formData.product_type,
        description: formData.description,
        fabric: formData.fabric,
        is_draft: formData.is_draft,
        variants:
          formData.variants?.map((v) => ({
            color: v.color,
            product_code: v.product_code,
            stock_keeping_unit: v.stock_keeping_unit,
            cost_price: v.cost_price,
            wholesale_price: v.wholesale_price,
            min_order_quantity: v.min_order_quantity,
            allow_customization: v.allow_customization,
            sizes: v.sizes,   
            images: [],
          })) || [],
      };

      const createRes = await api.post('/products/', productPayload);
      const backendVariants = createRes.data.variants;

      if (formData.images?.length) {
        const productImgFormData = new FormData();
        formData.images.forEach((img) => {
          productImgFormData.append('images', img);
          productImgFormData.append('view_types', 'front');
        });

        await api.post(`/product-images`, productImgFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (formData.variants?.length) {
        for (let i = 0; i < formData.variants.length; i++) {
          const variant = formData.variants[i];
          const backendVariant = backendVariants[i];
          if (!backendVariant || !variant.images?.length) continue;

          const variantFormData = new FormData();
          variantFormData.append('variant_id', backendVariant.id.toString());

          variant.images.forEach((img) => {
            variantFormData.append('images', img);
            variantFormData.append('view_types', 'front');
          });

          await api.post('/product-images', variantFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      setSuccess(true);
      return createRes.data;
    } catch (err: any) {
      console.error('Error:', err.response?.data || err.message);

      if (err.response?.data?.variants) {
        const variantErr = err.response.data.variants[0];
        const msg = Object.values(variantErr).flat().join(", ");
        setError(msg);
      } else {
        setError(err.response?.data?.message || 'Failed to add product');
      }

      throw err;
    }
  };

  return { addProduct, isLoading, error, setError, success };
};
