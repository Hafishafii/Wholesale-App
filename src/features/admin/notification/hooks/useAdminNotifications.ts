import { useCallback, useEffect, useState } from "react";
import type { AdminNotification } from "../types";
import api from "../../../../lib/api";

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false); 
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (pageNumber: number = 1, isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else if (pageNumber !== page) setPageLoading(true);
        else setLoading(true);

        const res = await api.get(`/notifications/?page=${pageNumber}&page_size=${pageSize}`);

        const notificationsArray = Array.isArray(res.data.results) ? res.data.results : [];
        const validTypes = ["alert", "purchase", "system"] as const;

        const sanitized: AdminNotification[] = notificationsArray.map((n: any) => ({
          id: n.id.toString(),
          message: n.message,
          timestamp: n.created_at || n.timestamp || new Date().toISOString(),
          isRead: n.is_read ?? false,
          type: validTypes.includes(n.type) ? n.type : "system",
          buyer: n.buyer ? { name: n.buyer.name, company: n.buyer.company } : undefined,
          items: n.items
            ? n.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                variant: item.variant,
              }))
            : undefined,
        }));

        setNotifications(sanitized);
        setUnreadCount(sanitized.filter((n) => !n.isRead).length);
        setNext(res.data.next);
        setPrevious(res.data.previous);
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
        setPageLoading(false);
      }
    },
    [pageSize, page]
  );

  const manualRefresh = useCallback(() => fetchNotifications(page, true), [fetchNotifications, page]);

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

  // Fetch on mount + interval refresh
  useEffect(() => {
    fetchNotifications(page);
    const interval = setInterval(() => fetchNotifications(page), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, page]);

  const changePage = (newPage: number) => fetchNotifications(newPage);

  return {
    notifications,
    loading,
    pageLoading,
    refreshing,
    error,
    unreadCount,
    manualRefresh,
    markAsRead,
    markAllAsRead,
    page,
    next,
    previous,
    setPage: changePage,
  };
};
