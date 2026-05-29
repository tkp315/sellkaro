import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useChatDetail, useSendMessage } from '@/modules/buyer/chat/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/format';

export default function ChatConversationPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { data: chat, isLoading } = useChatDetail(chatId!);
  const sendMessage = useSendMessage(chatId!);
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sendMessage.isPending) return;
    sendMessage.mutate(text.trim());
    setText('');
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 mx-auto" style={{ borderTopColor: theme.colors.brand.DEFAULT }} />
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl mb-4">💬</p>
        <h2 className="text-xl font-semibold text-gray-800">Chat not found</h2>
        <Link to="/chats" className="mt-4 text-sm font-medium hover:underline" style={{ color: theme.colors.brand.DEFAULT }}>
          Back to chats
        </Link>
      </div>
    );
  }

  const isBuyer = chat.buyerId === user?.id;
  const other = isBuyer ? chat.seller : chat.buyer;
  const otherName = other.profile?.name ?? 'User';
  const coverImg = chat.ad.images[0]?.url;

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
        <Link to="/chats" className="text-gray-400 hover:text-gray-600 transition">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div
          className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold"
          style={{ backgroundColor: theme.colors.brand.DEFAULT, color: theme.colors.accent.DEFAULT }}
        >
          {otherName[0]!.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{otherName}</p>
          <p className="text-xs text-gray-500 truncate">Re: {chat.ad.title}</p>
        </div>

        {coverImg && (
          <Link to={`/product/${chat.adId}`}>
            <img src={coverImg} alt={chat.ad.title} className="h-10 w-10 rounded-xl object-cover" />
          </Link>
        )}
      </div>

      {/* Ad summary banner */}
      <Link
        to={`/product/${chat.adId}`}
        className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 hover:bg-gray-100 transition"
      >
        {coverImg && <img src={coverImg} alt="" className="h-8 w-8 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700 truncate">{chat.ad.title}</p>
        </div>
        <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {chat.messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
          </div>
        )}

        {chat.messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe ? 'rounded-br-md' : 'rounded-bl-md bg-white border border-gray-100'
                }`}
                style={isMe ? { backgroundColor: theme.colors.brand.DEFAULT, color: '#fff' } : undefined}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`mt-1 text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'} text-right`}>
                  {formatRelativeTime(msg.createdAt)}
                  {isMe && (
                    <span className="ml-1">{msg.isRead ? ' ✓✓' : ' ✓'}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-end gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-300 max-h-32"
          style={{ lineHeight: '1.5' }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMessage.isPending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: theme.colors.brand.DEFAULT }}
        >
          <svg className="h-4 w-4 text-white translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
