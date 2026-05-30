import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSellerPublicProfile } from '@/modules/seller/ads/services/sellerAdsApi';
import { useSellerReviews } from '@/modules/shared/review/hooks/useReviews';
import StarRating from '@/components/ui/StarRating';
import { useTheme } from '@/hooks/useTheme';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import type { ConditionKey } from '@/lib/colors';

export default function SellerPublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { theme, getConditionStyle } = useTheme();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seller-profile', userId],
    queryFn: () => fetchSellerPublicProfile(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
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

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-gray-800">Seller not found</h2>
        <Link to="/" className="mt-4 text-sm font-medium hover:underline" style={{ color: theme.colors.brand.DEFAULT }}>
          Browse Ads
        </Link>
      </div>
    );
  }

  const { seller, ads } = data;
  const sellerName = seller.profile?.name ?? 'Seller';
  const { data: reviewsData } = useSellerReviews(userId!);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Seller profile card */}
      <div className="card mb-8 p-6">
        <div className="flex items-start gap-5">
          {seller.profile?.avatar ? (
            <img src={seller.profile.avatar} alt={sellerName} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div
              className="h-20 w-20 shrink-0 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: theme.colors.brand.DEFAULT, color: theme.colors.accent.DEFAULT }}
            >
              {sellerName[0]!.toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{sellerName}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {seller.profile?.city && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {seller.profile.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {formatRelativeTime(seller.createdAt)}
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: theme.colors.brand.DEFAULT + '15', color: theme.colors.brand.DEFAULT }}
              >
                {seller.activeAdsCount} active listing{seller.activeAdsCount !== 1 ? 's' : ''}
              </span>
              {reviewsData && reviewsData.total > 0 && (
                <span className="flex items-center gap-1.5">
                  <StarRating value={Math.round(reviewsData.avg)} size="sm" />
                  <span className="text-sm font-semibold text-gray-700">{reviewsData.avg}</span>
                  <span className="text-gray-400">({reviewsData.total} review{reviewsData.total !== 1 ? 's' : ''})</span>
                </span>
              )}
            </div>

            {seller.profile?.bio && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{seller.profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Active listings */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Active Listings</h2>
        <span className="text-sm text-gray-500">{ads.length} item{ads.length !== 1 ? 's' : ''}</span>
      </div>

      {ads.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">No active listings right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ads.map((ad) => {
            const cover = ad.images.find((i) => i.isCover) ?? ad.images[0];
            const condStyle = getConditionStyle(ad.condition as ConditionKey);
            return (
              <Link
                key={ad.id}
                to={`/product/${ad.id}`}
                className="group block rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {cover ? (
                    <img src={cover.url} alt={ad.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: condStyle.bg, color: condStyle.text }}>
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
            );
          })}
        </div>
      )}

      {/* Reviews Section */}
      {reviewsData && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
            <span className="text-sm text-gray-500">{reviewsData.total} review{reviewsData.total !== 1 ? 's' : ''}</span>
          </div>

          {reviewsData.total === 0 ? (
            <div className="card py-10 text-center">
              <p className="text-3xl mb-2">⭐</p>
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            </div>
          ) : (
            <>
              {/* Rating summary */}
              <div className="card p-5 mb-4 flex items-center gap-8">
                <div className="text-center">
                  <p className="text-5xl font-black text-gray-900">{reviewsData.avg}</p>
                  <StarRating value={Math.round(reviewsData.avg)} size="md" />
                  <p className="text-xs text-gray-400 mt-1">{reviewsData.total} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {reviewsData.breakdown.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{star}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: reviewsData.total > 0 ? `${(count / reviewsData.total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-4">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual reviews */}
              <div className="space-y-3">
                {reviewsData.reviews.map((review) => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: theme.colors.brand.DEFAULT }}
                      >
                        {(review.reviewer.profile?.name ?? 'U')[0]!.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {review.reviewer.profile?.name ?? 'User'}
                          </p>
                          <p className="text-xs text-gray-400 shrink-0">{formatRelativeTime(review.createdAt)}</p>
                        </div>
                        <StarRating value={review.rating} size="sm" />
                        {review.comment && (
                          <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
