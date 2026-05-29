import { Link } from 'react-router-dom';
import { useCart, useRemoveFromCart, useClearCart } from '@/modules/buyer/cart/hooks/useCart';
import { useStartChat } from '@/modules/buyer/chat/hooks/useChat';
import { useTheme } from '@/hooks/useTheme';
import { formatPrice } from '@/utils/format';
import type { ConditionKey } from '@/lib/colors';

export default function CartPage() {
  const { data, isLoading } = useCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const startChat = useStartChat();
  const { theme, getConditionStyle } = useTheme();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 h-8 w-32 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                  <div className="h-5 w-24 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => clearCart.mutate()}
            disabled={clearCart.isPending}
            className="text-sm font-medium text-red-500 hover:text-red-600 transition disabled:opacity-50"
          >
            {clearCart.isPending ? 'Clearing...' : 'Clear all'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Your cart is empty</h3>
          <p className="mt-1 text-sm text-gray-500">Browse listings and add items you're interested in.</p>
          <Link
            to="/"
            className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: theme.colors.brand.DEFAULT }}
          >
            Browse Ads
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Left — item cards */}
          <div className="space-y-3">
            {items.map((item) => {
              const cover = item.ad.images[0]?.url;
              const condStyle = getConditionStyle(item.ad.condition as ConditionKey);

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  {/* Thumbnail */}
                  <Link to={`/product/${item.ad.id}`} className="shrink-0">
                    {cover ? (
                      <img
                        src={cover}
                        alt={item.ad.title}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.ad.id}`}>
                      <p className="font-semibold text-gray-900 hover:underline line-clamp-2 leading-snug">
                        {item.ad.title}
                      </p>
                    </Link>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: condStyle.bg, color: condStyle.text }}
                      >
                        {condStyle.label}
                      </span>
                      <span className="text-xs text-gray-400">{item.ad.city}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">
                        {item.ad.user.profile?.name ?? 'Seller'}
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-black" style={{ color: theme.colors.brand.DEFAULT }}>
                      {formatPrice(item.priceAtAdded)}
                    </p>

                    {/* Per-item action */}
                    <button
                      onClick={() => startChat.mutate(item.adId)}
                      disabled={startChat.isPending}
                      className="mt-2 flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      💬 Chat with Seller
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart.mutate(item.adId)}
                    disabled={removeFromCart.isPending}
                    className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition"
                    aria-label="Remove from cart"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right — order summary */}
          <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Order Summary</h2>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                  <span className="text-gray-500 line-clamp-1 flex-1">{item.ad.title}</span>
                  <span className="shrink-0 font-semibold text-gray-800">
                    {formatPrice(item.priceAtAdded)}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-gray-100" />

            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-black" style={{ color: theme.colors.brand.DEFAULT }}>
                {formatPrice(total)}
              </span>
            </div>

            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              💡 OLX is a peer-to-peer marketplace. Contact each seller directly to negotiate and purchase.
            </p>

            <Link
              to="/chats"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: theme.colors.brand.DEFAULT }}
            >
              💬 Go to My Chats
            </Link>

            <Link
              to="/"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Continue Browsing
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
