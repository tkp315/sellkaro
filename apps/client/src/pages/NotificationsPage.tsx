import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkAllRead, useMarkRead } from '@/modules/shared/notification/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/format';

const NOTIFICATION_ICON: Record<string, string> = {
  WELCOME: '🎉',
  NEW_MESSAGE: '💬',
  INTEREST_SHOWN: '👀',
  AD_SOLD: '✅',
  AD_REMOVED_BY_ADMIN: '🚫',
  AD_EXPIRED: '⏰',
  REPORT_RESOLVED: '🛡',
  ACCOUNT_WARNED: '⚠️',
  ACCOUNT_BANNED: '🔒',
};

function getNavTarget(type: string, data: Record<string, unknown> | null): string | null {
  if (type === 'NEW_MESSAGE' && data?.chatId) return `/chats/${data.chatId}`;
  if (type === 'INTEREST_SHOWN' && data?.adId) return `/product/${data.adId}`;
  return null;
}

export default function NotificationsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const handleClick = (id: string, type: string, data: Record<string, unknown> | null, isRead: boolean) => {
    if (!isRead) markRead.mutate(id);
    const target = getNavTarget(type, data);
    if (target) navigate(target);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">{total} total</p>
        </div>
        {(data?.unread ?? 0) > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-sm font-medium hover:underline disabled:opacity-50"
            style={{ color: theme.colors.brand.DEFAULT }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No notifications yet</h3>
          <p className="mt-1 text-sm text-gray-500">We'll notify you about messages, interests, and more.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const icon = NOTIFICATION_ICON[n.type] ?? '🔔';
            const isClickable = !!getNavTarget(n.type, n.data);
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n.id, n.type, n.data, n.isRead)}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                  isClickable ? 'cursor-pointer hover:shadow-sm' : ''
                } ${n.isRead ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50'}`}
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: n.isRead ? '#f1f5f9' : theme.colors.brand.DEFAULT + '15' }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                    {n.title}
                  </p>
                  {n.body && <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.body}</p>}
                  <p className="mt-1 text-[11px] text-gray-400">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: theme.colors.brand.DEFAULT }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 transition">
            ← Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 transition">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
