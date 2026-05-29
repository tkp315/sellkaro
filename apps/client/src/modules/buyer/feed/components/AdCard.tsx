import { Link, useNavigate } from 'react-router-dom';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useToggleWishlist, useWishlistIds } from '@/modules/buyer/wishlist/hooks/useWishlist';
import type { ConditionKey } from '@/lib/colors';
import type { AdListItem } from '../types';

interface Props {
  ad: AdListItem;
}

export default function AdCard({ ad }: Props) {
  const { getConditionStyle, theme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const cover = ad.images[0]?.url;
  const condStyle = getConditionStyle(ad.condition as ConditionKey);

  const { data: wishlistIds = [] } = useWishlistIds();
  const toggleWishlist = useToggleWishlist();
  const isSaved = wishlistIds.includes(ad.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    toggleWishlist.mutate(ad.id);
  };

  return (
    <Link
      to={`/product/${ad.id}`}
      className="group block rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={ad.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-1 text-gray-300">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">No photo</span>
          </div>
        )}

        <span
          className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: condStyle.bg, color: condStyle.text }}
        >
          {condStyle.label}
        </span>

        {/* Wishlist heart */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 active:scale-95"
          aria-label={isSaved ? 'Remove from saved' : 'Save'}
        >
          <svg
            className="h-4 w-4 transition-colors"
            viewBox="0 0 24 24"
            fill={isSaved ? theme.colors.status.error : 'none'}
            stroke={isSaved ? theme.colors.status.error : '#9ca3af'}
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-base font-bold text-gray-900">{formatPrice(ad.price)}</p>
        <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 leading-snug">{ad.title}</p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1 truncate">
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {ad.city}
          </span>
          <span className="shrink-0 ml-2">{formatRelativeTime(ad.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
