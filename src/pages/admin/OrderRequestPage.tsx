import { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { OrderRequestTable } from "../../features/admin/order/components/OrderRequestTable";
import type { OrderRequest } from "../../features/admin/order/types";
import api from "../../lib/api";


const normalizeStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Approved";
    case "in_review":
      return "In Review";
    case "in_production":
      return "In Production";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
};


const backendStatusMap: Record<string, string> = {
  Pending: "pending",
  Approved: "accepted",
  "In Review": "in_review",
  "In Production": "in_production",
  Shipped: "shipped",
  Delivered: "delivered",
  Rejected: "rejected",
};

const OrderRequestPage = () => {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<{
    status?: string[];
    dateRange?: string;
  }>({});

  const fetchOrders = async (
    url = "/orders/admin/orders/",
    filters: { status?: string[]; dateRange?: string } = {}
  ) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};

      if (filters.status && filters.status.length > 0) {
        params.status = filters.status.join(",");
      }
      if (filters.dateRange) {
        params.date_range = filters.dateRange;
      }

      const response = await api.get(url, { params });
      const data = response.data;

      let ordersData: any[] = [];
      if (Array.isArray(data)) {
        ordersData = data;
      } else if (Array.isArray(data.orders)) {
        ordersData = data.orders;
      } else if (Array.isArray(data.results)) {
        ordersData = data.results;
      }

      const normalized: OrderRequest[] = ordersData.map((order) => {
        const firstItem = order.items?.length > 0 ? order.items[0] : {};
        const variantDetail = firstItem.variant_detail || {};

        let customerName = "Unknown";
        if (order.address_data?.name) {
          customerName = order.address_data.name;
        } else if (order.user?.first_name || order.user?.last_name) {
          customerName = `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim();
        }

        let contactInfo = "N/A";
        if (order.address_data?.phone) contactInfo = order.address_data.phone;
        else if (order.user?.phone_number) contactInfo = order.user.phone_number;
        else if (order.user?.email) contactInfo = order.user.email;

        return {
          id: order.id?.toString() || order._id?.toString() || "unknown-id",
          date: order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : "",
          status: normalizeStatus(order.status || "pending"),
          customerName,
          contact: contactInfo,
          product: firstItem.product_name || "N/A",
          fabric: firstItem.fabric_type || variantDetail.fabric_type || "N/A",
          color: variantDetail.color || "N/A",
          quantity: firstItem.quantity || 0,
          totalPrice: order.total_price || "0.00",
        };
      });

      const deduplicate = (list: OrderRequest[]) =>
        list.filter(
          (order, index, self) => index === self.findIndex((o) => o.id === order.id)
        );

      if (
        url === "/orders/admin/orders/" ||
        JSON.stringify(filters) !== JSON.stringify(currentFilters)
      ) {
        setOrders(deduplicate(normalized));
        setCurrentFilters(filters);
      } else {
        setOrders((prev) => deduplicate([...prev, ...normalized]));
      }

      setNextPageUrl(data.next || null);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = ({
    status,
    startDate,
    endDate,
  }: {
    status: string;
    startDate: string;
    endDate: string;
  }) => {
    const backendStatus =
      status !== "All" ? [backendStatusMap[status] || status.toLowerCase()] : [];

    let dateRange: string | undefined;
    if (startDate && endDate) {
      dateRange = `${startDate},${endDate}`;
    }

    fetchOrders("/orders/admin/orders/", {
      status: backendStatus,
      dateRange,
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-screen-xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6">
          Order Requests
        </h1>

        <OrderRequestTable
          orders={orders}
          loading={loading}
          onFilterChange={handleFilterChange}
        />

        {nextPageUrl && (
          <div className="text-center mt-6">
            <button
              onClick={() => fetchOrders(nextPageUrl, currentFilters)}
              disabled={loading}
              className="text-sm sm:text-base text-blue-600 hover:underline font-semibold disabled:opacity-50"
            >
              {loading ? "Loading..." : "See More"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderRequestPage;
