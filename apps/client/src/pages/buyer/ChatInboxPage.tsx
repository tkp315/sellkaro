import { Link } from 'react-router-dom';
import { useMyChats } from '@/modules/buyer/chat/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/format';

export default function ChatInboxPage() {
  const { data: chats = [], isLoading } = useMyChats();
  const { user } = useAuthStore();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 h-8 w-32 animate-pulse rounded-xl bg-gray-200" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-3 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded-full" />
              <div className="h-3 w-48 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
        <p className="mt-1 text-sm text-gray-500">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No conversations yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start a chat by clicking "Chat with Seller" on any listing.</p>
          <Link
            to="/"
            className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: theme.colors.brand.DEFAULT }}
          >
            Browse Ads
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => {
            const isBuyer = chat.buyerId === user?.id;
            const other = isBuyer ? chat.seller : chat.buyer;
            const otherName = other.profile?.name ?? 'User';
            const lastMsg = chat.messages[0];
            const coverImg = chat.ad.images[0]?.url;

            return (
              <Link
                key={chat.id}
                to={`/chats/${chat.id}`}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 hover:bg-gray-50 hover:shadow-sm transition"
              >
                {/* Avatar */}
                <div
                  className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: theme.colors.brand.DEFAULT, color: theme.colors.accent.DEFAULT }}
                >
                  {otherName[0]!.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 truncate">{otherName}</p>
                    {lastMsg && (
                      <span className="shrink-0 text-xs text-gray-400">{formatRelativeTime(lastMsg.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    Re: <span className="text-gray-700">{chat.ad.title}</span>
                  </p>
                  {lastMsg && (
                    <p className="mt-0.5 text-xs text-gray-400 truncate">
                      {lastMsg.senderId === user?.id ? 'You: ' : ''}{lastMsg.content}
                    </p>
                  )}
                </div>

                {/* Ad thumbnail */}
                {coverImg && (
                  <img
                    src={coverImg}
                    alt={chat.ad.title}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
