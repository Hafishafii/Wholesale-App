import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories } from '../../features/admin/AddProduct';
import { useEditProduct } from '../../features/admin/AddProduct/hooks/useEditProduct';
import { ProductInfoForm, ImageUploadForm } from '../../features/admin/AddProduct';
import api from '../../lib/api';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { editProduct, isLoading, error, success } = useEditProduct();

  const [formData, setFormData] = useState<any>({
    category_id: '',
    name: '',
    product_type: '',
    fabric: '',
    description: '',
    is_draft: false,
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // Fetch product details
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}/`);
        const product = res.data;

        setFormData({
          category_id: product.category?.id || '',
          name: product.name,
          product_type: product.product_type,
          fabric: product.fabric,
          description: product.description,
          is_draft: product.is_draft,
        });

        setExistingImages(product.images?.map((img: any) => img.image_url) || []);
        setVariants(product.variants || []);
      } catch (err) {
        console.error('Failed to fetch product', err);
      }
    };

    fetchProduct();
  }, [id]);

  // Redirect after successful update
  useEffect(() => {
    if (success) navigate('/admin/products');
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await editProduct(Number(id), {
      ...formData,
      category_id: Number(formData.category_id),
      images,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      {error && <div className="bg-red-200 text-red-700 p-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Product Info */}
        <ProductInfoForm
          categories={categories}
          formData={formData}
          onInputChange={(e) => {
            const { name, value, type, checked } = e.target as HTMLInputElement;
            setFormData((prev: any) => ({
              ...prev,
              [name]: type === 'checkbox' ? checked : value,
            }));
          }}
        />

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Existing Product Images</p>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img, i) => (
                <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded border" />
              ))}
            </div>
          </div>
        )}

        {/* Upload New Images */}
        <ImageUploadForm onImagesChange={setImages} />

        {/* View Variants (non-editable) */}
        {variants.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-2">Variants</h2>
            {variants.map((variant, i) => (
              <div key={variant.id || i} className="border p-3 mb-3 rounded">
                <p><strong>Color:</strong> {variant.color}</p>
                <p><strong>Size:</strong> {Array.isArray(variant.size) ? variant.size.join(', ') : variant.size}</p>
                <p><strong>Product Code:</strong> {variant.product_code}</p>
                <p><strong>SKU:</strong> {variant.stock_keeping_unit}</p>
                <p><strong>Cost Price:</strong> {variant.cost_price}</p>
                <p><strong>Wholesale Price:</strong> {variant.wholesale_price}</p>
                <p><strong>MOQ:</strong> {variant.min_order_quantity}</p>
                <p><strong>Stock:</strong> {variant.current_stock}</p>
                <p><strong>Customization:</strong> {variant.allow_customization ? 'Yes' : 'No'}</p>

                {/* Variant Images */}
                {Array.isArray(variant.variant_images) && (
                  <div className="flex gap-2 mt-2">
                    {variant.variant_images.map((img: any, idx: number) => (
                      <img key={idx} src={img.image} alt="" className="w-16 h-16 object-cover rounded border" />
                    ))}
                  </div>
                )}
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
            {isLoading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
