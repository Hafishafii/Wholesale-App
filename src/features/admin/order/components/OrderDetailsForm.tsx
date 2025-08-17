import { useState } from "react";
import type { OrderDetails, OrderStatus } from "../types";
import { Input } from "../../../../components/ui/input";
import { useNavigate } from "react-router-dom";
import api from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";

// Backend's status choices - ensure these match exactly what the backend expects
const backendStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

type Props = {
  order: OrderDetails;
};

const OrderDetailsForm = ({ order }: Props) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    (order.status?.toLowerCase() as OrderStatus) || "pending"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdateStatus = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.patch(
        `/orders/order/${order._id}/update_status/`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/admin/orders");
        }, 1000);
      } else {
        setError("Failed to update status. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);
      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to update status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasCustomization =
    order.customization?.fabric ||
    order.customization?.color ||
    order.customization?.colorReferenceImg;

  const hasPatternStyle = order.patternStyle || order.sampleImage;
  const hasBranding = order.branding;
  const hasQuantity = order.quantity || order.bulkOrder;

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Order Details</h1>

      {/* Status Update Section - Moved to top for better visibility */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              disabled={loading}
              className="w-full border rounded px-3 py-2"
            >
              {backendStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleUpdateStatus}
            disabled={loading || selectedStatus === order.status?.toLowerCase()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </div>
        
        {error && (
          <div className="mt-3 text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="mt-3 text-green-600 text-sm">
            Status updated successfully!
          </div>
        )}
      </div>

      {/* Rest of your form components remain the same */}
      {/* Customer Info */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-gray-200">
          Customer Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input value={order.customerName || ""} disabled />
          <Input value={order.email || ""} disabled />
          <Input value={order.phone || ""} disabled />
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-gray-200">
          Order Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            value={order.totalPrice ? `₹${order.totalPrice}` : ""}
            disabled
          />
          <Input
            value={
              order.orderedAt
                ? new Date(order.orderedAt).toLocaleString()
                : ""
            }
            disabled
          />
        </div>
      </div>

      {/* Product Type */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-gray-200">
          Product Type
        </h2>
        <div className="flex gap-4">
          {["Sarees", "Kurtas", "Others"].map((type) => {
            const isSelected = order.productType === type;
            return (
              <label
                key={type}
                className={`flex items-center gap-3 px-5 py-2 rounded-full border text-sm cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
              >
                <input type="radio" checked={isSelected} disabled className="hidden" />
                {type}
              </label>
            );
          })}
        </div>
      </div>

      {/* Customization */}
      {hasCustomization && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-gray-200">
            Customization Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {order.customization?.fabric && (
              <Input value={order.customization.fabric} disabled />
            )}
            {(order.customization?.color ||
              order.customization?.colorReferenceImg) && (
              <div className="flex items-center gap-5 mt-2">
                {order.customization?.color && (
                  <div
                    className="w-10 h-10 rounded-full border-2 border-gray-300"
                    style={{
                      backgroundColor: order.customization.color || "transparent",
                    }}
                  />
                )}
                {order.customization?.colorReferenceImg && (
                  <img
                    src={order.customization.colorReferenceImg}
                    alt="Color ref"
                    className="w-20 h-20 object-cover rounded border"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pattern Style */}
      {hasPatternStyle && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-gray-200">
            Style & Pattern
          </h2>
          {order.patternStyle && <Input value={order.patternStyle} disabled />}
          {order.sampleImage && (
            <img
              src={order.sampleImage}
              alt="Sample pattern"
              className="w-28 h-28 object-cover rounded border mt-2"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      )}

      {/* Branding */}
      {hasBranding && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={order.branding || false} disabled />
            <span className="text-sm">Custom branding included</span>
          </label>
        </div>
      )}

      {/* Quantity */}
      {hasQuantity && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          {order.quantity && <Input type="number" value={order.quantity} disabled />}
          {order.bulkOrder && (
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={order.bulkOrder || false} disabled />
              <span className="text-sm">Bulk Order (50+)</span>
            </label>
          )}
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <textarea
            value={order.notes}
            disabled
            className="w-full border border-gray-300 p-4 rounded bg-gray-50 text-sm h-40"
          />
        </div>
      )}

      {/* Shipping Address */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <p>{order.customerName}</p>
        <p>{order.phone}</p>
        <p>{order.address}</p>
        <p>{order.locality}</p>
        <p>
          {order.city}, {order.state} - {order.pincode}
        </p>
        {order.landmark && <p>Landmark: {order.landmark}</p>}
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Color</th>
                <th className="p-2 text-left">Size</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">
                    {item.variant?.images?.[0]?.image && (
                      <img
                        src={item.variant.images[0].image}
                        alt="product"
                        className="w-16 h-16 object-cover"
                      />
                    )}
                  </td>
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2">{item.variant?.color || "-"}</td>
                  <td className="p-2">{item.variant?.size || "-"}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">₹{item.priceAtPurchase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsForm;