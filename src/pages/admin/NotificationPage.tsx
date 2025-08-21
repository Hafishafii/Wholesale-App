import { Button } from "../../components/ui/button";
import { BellIcon, CheckIcon, RefreshCwIcon } from "lucide-react";
import {
  useAdminNotifications,
  NotificationItem,
  NotificationListSkeleton,
} from "../../features/admin/notification";

export const NotificationPage = () => {
  const {
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
    setPage,
  } = useAdminNotifications();

  const isLoading = loading || pageLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>

        <div className="flex flex-wrap gap-2">
          <Button onClick={manualRefresh} variant="outline" disabled={refreshing}>
            <RefreshCwIcon
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={markAllAsRead} disabled={isLoading || notifications.length === 0}>
            <CheckIcon className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {error && <div className="p-4 text-sm text-destructive">{error}</div>}

        {isLoading && notifications.length === 0 ? (
          <NotificationListSkeleton />
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <>
            {isLoading ? (
              <NotificationListSkeleton />
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkAsRead={markAsRead}
                  loading={isLoading}
                />
              ))
            )}

            {/* Dynamic Pagination with current page */}
            {!loading && (next || previous) && (
              <div className="flex justify-center mt-6 gap-2 flex-wrap items-center">
                <Button
                  variant="outline"
                  onClick={() => previous && setPage(page - 1)}
                  disabled={!previous || pageLoading}
                >
                  Prev
                </Button>

                <span className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                  {pageLoading ? "Loading..." : `Page ${page}`}
                </span>

                <Button
                  variant="outline"
                  onClick={() => next && setPage(page + 1)}
                  disabled={!next || pageLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
