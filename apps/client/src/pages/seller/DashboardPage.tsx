import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useMyAds, useChangeAdStatus, useDeleteAd } from '@/modules/seller/ads/hooks/useSellerAds';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import { useTheme } from '@/hooks/useTheme';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
import type { AdStatusKey } from '@/lib/colors';
import type { AdStatus } from '@/modules/seller/ads/types';

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const { data: ads = [], isLoading } = useMyAds();
  const { mutate: changeStatus } = useChangeAdStatus();
  const { mutate: deleteAd } = useDeleteAd();
  const { theme, getAdStatusStyle } = useTheme();

  const activeCount = ads.filter((a) => a.status === 'ACTIVE').length;
  const totalViews = ads.reduce((sum, a) => sum + a.viewCount, 0);

  const { page, goToPage, totalPages, pageItems } = usePagination(ads, 8);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ads</h1>
          <p className="mt-0.5 text-sm text-gray-500">Welcome back, {user?.profile?.name ?? user?.email}</p>
        </div>
        <Link to="/seller/ads/new" className="btn-accent">
          + Post New Ad
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Ads', value: ads.length, icon: '📋' },
          { label: 'Active', value: activeCount, icon: '✅' },
          { label: 'Total Views', value: totalViews.toLocaleString('en-IN'), icon: '👁' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse card h-24" />
          ))}
        </div>
      )}

      {!isLoading && ads.length === 0 && (
        <div className="card py-20 text-center">
          <p className="text-5xl mb-4">📭</p>
          <h3 className="text-lg font-semibold text-gray-800">No ads yet</h3>
          <p className="mt-1 text-sm text-gray-500 mb-6">Start selling by posting your first ad</p>
          <Link to="/seller/ads/new" className="btn-primary inline-flex">
            Post your first ad
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {pageItems.map((ad) => {
          const cover = ad.images.find((i) => i.isCover) ?? ad.images[0];
          const statusStyle = getAdStatusStyle(ad.status as AdStatusKey);

          return (
            <div key={ad.id} className="card flex gap-4 p-4 hover:shadow-md transition-shadow">
              {/* Cover image */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {cover ? (
                  <img src={cover.url} alt={ad.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 text-xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 truncate">{ad.title}</p>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      borderColor: statusStyle.text + '33',
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>
                <p
                  className="mt-0.5 text-base font-bold"
                  style={{ color: theme.colors.brand.DEFAULT }}
                >
                  {formatPrice(ad.price)}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span>📍 {ad.city}</span>
                  <span>👁 {ad.viewCount} views</span>
                  <span>{formatRelativeTime(ad.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col gap-1.5 text-xs">
                <Link
                  to={`/seller/ads/${ad.id}/edit`}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-center text-gray-700 hover:bg-gray-50 transition"
                >
                  ✏️ Edit
                </Link>
                {ad.status !== 'ACTIVE' && (
                  <button
                    onClick={() => changeStatus({ id: ad.id, status: 'ACTIVE' as AdStatus })}
                    className="rounded-lg border px-3 py-1.5 font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: theme.colors.status.successBg,
                      color: theme.colors.status.successText,
                      borderColor: theme.colors.status.successText + '44',
                    }}
                  >
                    Activate
                  </button>
                )}
                {ad.status === 'ACTIVE' && (
                  <button
                    onClick={() => changeStatus({ id: ad.id, status: 'PAUSED' as AdStatus })}
                    className="rounded-lg border px-3 py-1.5 font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: theme.colors.status.warningBg,
                      color: theme.colors.status.warningText,
                      borderColor: theme.colors.status.warningText + '44',
                    }}
                  >
                    Pause
                  </button>
                )}
                {ad.status !== 'SOLD' && (
                  <button
                    onClick={() => changeStatus({ id: ad.id, status: 'SOLD' as AdStatus })}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition font-medium"
                  >
                    Mark Sold
                  </button>
                )}
                <button
                  onClick={() => { if (confirm('Delete this ad?')) deleteAd(ad.id); }}
                  className="rounded-lg border px-3 py-1.5 font-medium transition hover:opacity-80"
                  style={{
                    backgroundColor: theme.colors.status.errorBg,
                    color: theme.colors.status.errorText,
                    borderColor: theme.colors.status.errorText + '33',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} className="mt-8" />
    </div>
  );
}
