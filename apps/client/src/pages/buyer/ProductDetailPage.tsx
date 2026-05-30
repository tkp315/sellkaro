import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAdDetail } from '@/modules/buyer/feed/hooks/useFeed';
import { revealPhone, reportAd } from '@/modules/buyer/feed/services/feedApi';
import { useSubmitReview, useMyReview } from '@/modules/shared/review/hooks/useReviews';
import StarRating from '@/components/ui/StarRating';
import { useToggleWishlist, useWishlistIds } from '@/modules/buyer/wishlist/hooks/useWishlist';
import { useAddToCart, useCartAdIds } from '@/modules/buyer/cart/hooks/useCart';
import { useStartChat } from '@/modules/buyer/chat/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import { isVideoUrl } from '@/utils/media';
import { useTheme } from '@/hooks/useTheme';
import { getApiError } from '@/utils/apiError';
import type { ConditionKey } from '@/lib/colors';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ad, isLoading, isError } = useAdDetail(id!);
  const [activeImg, setActiveImg] = useState(0);
  const [phone, setPhone] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDone, setReportDone] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const { theme, getConditionStyle } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: location } });
      return false;
    }
    return true;
  };

  const { data: wishlistIds = [] } = useWishlistIds();
  const toggleWishlist = useToggleWishlist();
  const cartAdIds = useCartAdIds();
  const addToCart = useAddToCart();
  const startChat = useStartChat();

  const isSaved = ad ? wishlistIds.includes(ad.id) : false;
  const isInCart = ad ? cartAdIds.includes(ad.id) : false;

  const revealPhoneMutation = useMutation({
    mutationFn: () => revealPhone(id!),
    onSuccess: (data) => setPhone(data.phone),
  });

  const reportMutation = useMutation({
    mutationFn: () => reportAd(id!, reportReason),
    onSuccess: () => { setReportDone(true); setShowReportModal(false); setReportReason(''); },
  });

  const sellerId = ad?.user.id ?? '';
  const submitReview = useSubmitReview(sellerId);
  const { data: myReview } = useMyReview(sellerId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="animate-pulse rounded-2xl bg-gray-200 aspect-[4/3]" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-16 w-16 rounded-xl bg-gray-200" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="animate-pulse h-8 w-3/4 rounded-xl bg-gray-200" />
            <div className="animate-pulse h-6 w-1/2 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !ad) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-gray-800">Ad not found</h2>
        <p className="mt-1 text-sm text-gray-500 mb-6">This listing may have been removed.</p>
        <Link to="/" className="btn-primary px-6">Browse other ads</Link>
      </div>
    );
  }

  const sellerName = ad.user.profile?.name ?? 'Seller';
  const condStyle = getConditionStyle(ad.condition as ConditionKey);
  const isOwnAd = user?.id === ad.user.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#002f34] transition">Home</Link>
        <span>›</span>
        <span>{ad.product.category.name}</span>
        {ad.product.subcategory && (
          <>
            <span>›</span>
            <span>{ad.product.subcategory.name}</span>
          </>
        )}
        <span>›</span>
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{ad.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: images + description */}
        <div>
          {/* Main image / video */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3]">
            {ad.images[activeImg] ? (
              isVideoUrl(ad.images[activeImg]!.url) ? (
                <video
                  key={ad.images[activeImg]!.url}
                  src={ad.images[activeImg]!.url}
                  controls
                  className="h-full w-full object-contain bg-black"
                />
              ) : (
                <img
                  src={ad.images[activeImg]!.url}
                  alt={ad.title}
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">No photos available</span>
              </div>
            )}

            {/* Wishlist button on image */}
            {!isOwnAd && (
              <button
                onClick={() => { if (requireAuth()) toggleWishlist.mutate(ad.id); }}
                className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:scale-110 active:scale-95"
              >
                <svg
                  className="h-5 w-5 transition-colors"
                  viewBox="0 0 24 24"
                  fill={isSaved ? theme.colors.status.error : 'none'}
                  stroke={isSaved ? theme.colors.status.error : '#9ca3af'}
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {ad.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {ad.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    i === activeImg ? 'opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={i === activeImg ? { borderColor: theme.colors.brand.DEFAULT } : undefined}
                >
                  {isVideoUrl(img.url) ? (
                    <>
                      <video src={img.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="h-4 w-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Details card */}
          <div className="mt-6 card p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">{ad.title}</h1>
              <p className="shrink-0 text-2xl font-black" style={{ color: theme.colors.brand.DEFAULT }}>
                {formatPrice(ad.price)}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: condStyle.bg, color: condStyle.text, borderColor: condStyle.text + '33' }}
              >
                {condStyle.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {ad.city}{ad.area ? `, ${ad.area}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                👁 {ad.viewCount} views
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                {formatRelativeTime(ad.createdAt)}
              </span>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <h2 className="mb-3 text-base font-semibold text-gray-800">Description</h2>
              <p className="whitespace-pre-line text-sm text-gray-600 leading-relaxed">{ad.description}</p>
            </div>
          </div>
        </div>

        {/* Right: seller card + actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Seller</h3>
            <div className="flex items-center gap-3">
              {ad.user.profile?.avatar ? (
                <img src={ad.user.profile.avatar} alt={sellerName} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: theme.colors.brand.DEFAULT, color: theme.colors.accent.DEFAULT }}
                >
                  {sellerName[0]!.toUpperCase()}
                </div>
              )}
              <div>
                <Link to={`/users/${ad.user.id}`} className="font-semibold text-gray-900 hover:underline">
                  {sellerName}
                </Link>
                {ad.user.profile?.city && (
                  <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ad.user.profile.city}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">Joined {formatRelativeTime(ad.user.createdAt)}</p>
              </div>
            </div>

            {!isOwnAd && (
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => { if (requireAuth()) startChat.mutate(ad.id); }}
                  disabled={startChat.isPending}
                  className="btn-accent w-full flex items-center justify-center gap-2"
                >
                  {startChat.isPending ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : '💬'}
                  {startChat.isPending ? 'Opening...' : 'Chat with Seller'}
                </button>

                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                    style={{ borderColor: theme.colors.brand.DEFAULT, color: theme.colors.brand.DEFAULT }}
                  >
                    📞 {phone}
                  </a>
                ) : (
                  <button
                    onClick={() => { if (requireAuth()) revealPhoneMutation.mutate(); }}
                    disabled={revealPhoneMutation.isPending}
                    className="w-full rounded-xl border-2 px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                    style={{ borderColor: theme.colors.brand.DEFAULT, color: theme.colors.brand.DEFAULT }}
                  >
                    {revealPhoneMutation.isPending ? 'Loading...' : '📞 Show Phone Number'}
                  </button>
                )}

                {revealPhoneMutation.error && (
                  <p className="text-center text-xs text-red-500">{getApiError(revealPhoneMutation.error)}</p>
                )}

                {/* Add to Cart */}
                {isInCart ? (
                  <Link
                    to="/cart"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                    style={{ color: theme.colors.brand.DEFAULT, borderColor: theme.colors.brand.DEFAULT + '40' }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    View in Cart
                  </Link>
                ) : (
                  <button
                    onClick={() => { if (requireAuth()) addToCart.mutate(ad.id); }}
                    disabled={addToCart.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
                  </button>
                )}

                {/* Save / unsave */}
                <button
                  onClick={() => { if (requireAuth()) toggleWishlist.mutate(ad.id); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill={isSaved ? theme.colors.status.error : 'none'}
                    stroke={isSaved ? theme.colors.status.error : 'currentColor'}
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isSaved ? 'Saved' : 'Save Ad'}
                </button>
              </div>
            )}

            {isOwnAd && (
              <div className="mt-5">
                <Link
                  to={`/seller/ads/${ad.id}/edit`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ borderColor: theme.colors.brand.DEFAULT, color: theme.colors.brand.DEFAULT }}
                >
                  ✏️ Edit Ad
                </Link>
              </div>
            )}

            {/* Rate this seller */}
            {!isOwnAd && isAuthenticated && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {myReview ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Your rating</p>
                      <StarRating value={myReview.rating} size="sm" />
                    </div>
                    <button
                      onClick={() => { setReviewRating(myReview.rating); setReviewComment(myReview.comment ?? ''); setShowReviewModal(true); }}
                      className="text-xs text-[#002f34] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    ⭐ Rate this Seller
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Safety tips */}
          <div className="card p-4 bg-amber-50 border-amber-100">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">🛡 Stay Safe</h3>
            <ul className="space-y-1 text-xs text-amber-700">
              <li>• Meet in a safe, public location</li>
              <li>• Never pay in advance</li>
              <li>• Inspect the item before buying</li>
              <li>• Don't share personal financial info</li>
            </ul>
          </div>

          {/* Report ad */}
          {!isOwnAd && (
            <div className="text-center">
              {reportDone ? (
                <p className="text-xs text-green-600 font-medium">✓ Report submitted. Thank you!</p>
              ) : (
                <button
                  onClick={() => { if (requireAuth()) setShowReportModal(true); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition underline"
                >
                  🚩 Report this ad
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">🚩 Report this Ad</h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-500">Why are you reporting this ad?</p>
              {[
                'Fraudulent or scam listing',
                'Prohibited or illegal item',
                'Misleading price or description',
                'Duplicate or spam listing',
                'Offensive content',
                'Other',
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="report_reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-[#002f34]"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
              {reportMutation.isError && (
                <p className="text-xs text-red-600">{getApiError(reportMutation.error)}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowReportModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={() => reportMutation.mutate()}
                  disabled={!reportReason || reportMutation.isPending}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-50"
                >
                  {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">⭐ Rate this Seller</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Your rating *</p>
                <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Comment <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none"
                  placeholder="Share your experience with this seller..."
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{reviewComment.length}/500</p>
              </div>
              {submitReview.isError && (
                <p className="text-xs text-red-600">{getApiError(submitReview.error)}</p>
              )}
              {submitReview.isSuccess && (
                <p className="text-xs text-green-600">✓ Review submitted!</p>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowReviewModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={() => submitReview.mutate(
                    { sellerId, rating: reviewRating, comment: reviewComment || undefined, adId: id },
                    { onSuccess: () => setShowReviewModal(false) }
                  )}
                  disabled={reviewRating === 0 || submitReview.isPending}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.brand.DEFAULT }}
                >
                  {submitReview.isPending ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
