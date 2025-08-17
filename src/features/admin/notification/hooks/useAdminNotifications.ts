import { useCallback, useEffect, useState } from "react";
import type { AdminNotification } from "../types";
import api from "../../../../lib/api";

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(
    async (pageNumber: number = 1, isManual = false) => {
      try {
        if (isManual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const res = await api.get(
          `/notifications/?page=${pageNumber}&page_size=${pageSize}`
        );

        const notificationsArray = Array.isArray(res.data.results)
          ? res.data.results
          : [];

        const validTypes = ["alert", "purchase", "system"] as const;

        const sanitized: AdminNotification[] = notificationsArray.map(
          (n: any) => ({
            id: n.id.toString(),
            message: n.message,
            timestamp:
              n.created_at || n.timestamp || new Date().toISOString(),
            isRead: n.is_read ?? false,
            type: validTypes.includes(n.type) ? n.type : "system",
            buyer: n.buyer
              ? {
                  name: n.buyer.name,
                  company: n.buyer.company,
                }
              : undefined,
            items: n.items
              ? n.items.map((item: any) => ({
                  name: item.name,
                  quantity: item.quantity,
                  variant: item.variant,
                }))
              : undefined,
          })
        );

        setNotifications(sanitized);
        setTotalCount(res.data.count || 0);
        setUnreadCount(sanitized.filter((n) => !n.isRead).length);
        setError(null);
        setPage(pageNumber);
      } catch (err) {
        setError("Failed to load notifications");
        console.error(err);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pageSize]
  );

  const manualRefresh = useCallback(() => {
    fetchNotifications(page, true);
  }, [fetchNotifications, page]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.post(`/notifications/${id}/mark-read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("/notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  }, []);

  // Fetch on mount + background refresh
  useEffect(() => {
    fetchNotifications(page);

    const interval = setInterval(() => {
      fetchNotifications(page); // stay on same page
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, page]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // ✅ fixed setPage
  const changePage = (newPage: number) => {
    setPage(newPage);
    fetchNotifications(newPage);
  };

  return {
    notifications,
    loading,
    refreshing,
    error,
    unreadCount,
    manualRefresh,
    markAsRead,
    markAllAsRead,
    page,
    totalPages,
    setPage: changePage,
  };
};
