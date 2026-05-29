import { Link } from 'react-router-dom';
import { useWishlist, useToggleWishlist } from '@/modules/buyer/wishlist/hooks/useWishlist';
import { useTheme } from '@/hooks/useTheme';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import type { ConditionKey } from '@/lib/colors';

export default function SavedPage() {
  const { data: ads = [], isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const { theme, getConditionStyle } = useTheme();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 h-8 w-40 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded-full" />
                <div className="h-3 w-full bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Ads</h1>
          <p className="mt-1 text-sm text-gray-500">{ads.length} item{ads.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No saved ads yet</h3>
          <p className="mt-1 text-sm text-gray-500">Tap the heart icon on any listing to save it here.</p>
          <Link
            to="/"
            className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: theme.colors.brand.DEFAULT }}
          >
            Browse Ads
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ads.map((ad) => {
            const cover = ad.images[0]?.url;
            const condStyle = getConditionStyle(ad.condition as ConditionKey);
            return (
              <div key={ad.id} className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <Link to={`/product/${ad.id}`} className="block">
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={ad.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-300">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <span
                      className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: condStyle.bg, color: condStyle.text }}
                    >
                      {condStyle.label}
                    </span>
                  </div>

                  <div className="p-3">
                    <p className="text-base font-bold text-gray-900">{formatPrice(ad.price)}</p>
                    <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 leading-snug">{ad.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{ad.city}</span>
                      <span>{formatRelativeTime(ad.createdAt)}</span>
                    </div>
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => toggleWishlist.mutate(ad.id)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 active:scale-95"
                  aria-label="Remove from saved"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill={theme.colors.status.error} stroke={theme.colors.status.error} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
