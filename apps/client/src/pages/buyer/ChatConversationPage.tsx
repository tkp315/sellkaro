import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useChatDetail, useSendMessage } from '@/modules/buyer/chat/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/store/uiStore';
import { formatRelativeTime } from '@/utils/format';
import { uploadFiles } from '@/lib/uploadApi';
import { socket } from '@/lib/socket';
import type { ChatMessage } from '@/modules/buyer/chat/services/chatApi';

const PHONE_REGEX = /(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|(\+91[\s-]?)?\d{10}/;
const hasPhone = (text: string) => PHONE_REGEX.test(text);

export default function ChatConversationPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { data: chat, isLoading } = useChatDetail(chatId!);
  const sendMessage = useSendMessage(chatId!);
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { showToast } = useUIStore();

  const [text, setText] = useState('');
  const [mediaUploading, setMediaUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  // Join socket room for real-time messages
  useEffect(() => {
    if (!chatId) return;
    socket.emit('join_chat', chatId);

    const handler = (msg: ChatMessage) => {
      qc.setQueryData(['chat', chatId], (old: any) => {
        if (!old) return old;
        const exists = old.messages.some((m: ChatMessage) => m.id === msg.id);
        if (exists) return old;
        return { ...old, messages: [...old.messages, msg] };
      });
    };

    socket.on('new_message', handler);
    return () => {
      socket.off('new_message', handler);
      socket.emit('leave_chat', chatId);
    };
  }, [chatId, qc]);


  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sendMessage.isPending) return;
    sendMessage.mutate({ content: text.trim() });
    setText('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) { showToast('Only images and videos allowed', 'error'); return; }

    setMediaUploading(true);
    try {
      const [result] = await uploadFiles([file]);
      sendMessage.mutate({
        content: '',
        mediaUrl: result!.url,
        mediaType: isVideo ? 'video' : 'image',
        awsUrl: result!.awsUrl,
      });
    } catch {
      showToast('Media upload failed', 'error');
    } finally {
      setMediaUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
          style={{ borderTopColor: theme.colors.brand.DEFAULT }} />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl mb-4">💬</p>
        <h2 className="text-xl font-semibold text-gray-800">Chat not found</h2>
        <Link to="/chats" className="mt-4 text-sm font-medium hover:underline" style={{ color: theme.colors.brand.DEFAULT }}>Back to chats</Link>
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
        <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold"
          style={{ backgroundColor: theme.colors.brand.DEFAULT, color: theme.colors.accent.DEFAULT }}>
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

      {/* Ad banner */}
      <Link to={`/product/${chat.adId}`}
        className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 hover:bg-gray-100 transition">
        {coverImg && <img src={coverImg} alt="" className="h-8 w-8 rounded-lg object-cover" />}
        <p className="flex-1 text-xs font-medium text-gray-700 truncate">{chat.ad.title}</p>
        <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Safety notice */}
      <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2">
        <span className="text-sm">🛡️</span>
        <p className="text-xs text-amber-700">Never share payment details or OTPs. Meet in public places only.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {chat.messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello!</p>
        )}

        {chat.messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const receiverSeePhoneWarning = !isMe && msg.content && hasPhone(msg.content);

          return (
            <div key={msg.id}>
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'rounded-br-md' : 'rounded-bl-md bg-white border border-gray-100'}`}
                  style={isMe ? { backgroundColor: theme.colors.brand.DEFAULT, color: '#fff' } : undefined}
                >
                  {/* Media */}
                  {msg.mediaUrl && msg.mediaType === 'image' && (
                    <img src={msg.mediaUrl} alt="shared"
                      className="mb-1.5 max-w-[220px] rounded-xl object-cover cursor-pointer"
                      onClick={() => window.open(msg.mediaUrl!, '_blank')} />
                  )}
                  {msg.mediaUrl && msg.mediaType === 'video' && (
                    <video src={msg.mediaUrl} controls className="mb-1.5 max-w-[220px] rounded-xl" />
                  )}

                  {msg.content && (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}

                  <p className={`mt-1 text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'} text-right`}>
                    {formatRelativeTime(msg.createdAt)}
                    {isMe && <span className="ml-1">{msg.isRead ? ' ✓✓' : ' ✓'}</span>}
                  </p>
                </div>
              </div>

              {/* Phone number warning for receiver */}
              {receiverSeePhoneWarning && (
                <div className="mt-1 ml-1 flex items-start gap-1.5">
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1 border border-amber-100">
                    ⚠️ Phone number shared — proceed <strong>at your own risk</strong>. Never pay before meeting in person.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Typing phone warning */}
      {hasPhone(text) && (
        <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50 px-4 py-2">
          <p className="text-xs text-amber-800">
            ⚠️ You are sharing a phone number. The other person can contact you directly — <strong>proceed at your own risk.</strong>
          </p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-gray-100 bg-white px-4 py-3">
        <button type="button" onClick={() => fileInputRef.current?.click()}
          disabled={mediaUploading}
          title="Send photo or video"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
          {mediaUploading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        <input ref={fileInputRef} type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="sr-only" onChange={handleFileSelect} />

        <textarea value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          placeholder="Type a message..." rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-300 max-h-32" />

        <button type="submit" disabled={!text.trim() || sendMessage.isPending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: theme.colors.brand.DEFAULT }}>
          <svg className="h-4 w-4 text-white translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
