import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useTheme } from '@/hooks/useTheme';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import Pagination from '@/components/ui/Pagination';

const STATUSES = ['', 'ACTIVE', 'PAUSED', 'SOLD', 'REMOVED'];

export default function AdminListingsPage() {
  const { theme } = useTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', search, status, page],
    queryFn: () => adminApi.getListings({ search, status, page, limit: 20 }),
  });

  const remove = useMutation({ mutationFn: (id: string) => adminApi.removeAd(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-listings'] }) });
  const feature = useMutation({ mutationFn: (id: string) => adminApi.featureAd(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-listings'] }) });

  const ads = data?.ads ?? [];
  const pagination = data?.pagination;

  const statusBadge: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700',
    PAUSED: 'bg-yellow-50 text-yellow-700',
    SOLD: 'bg-gray-100 text-gray-600',
    REMOVED: 'bg-red-50 text-red-700',
    EXPIRED: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
        <p className="mt-1 text-sm text-gray-500">{pagination?.total?.toLocaleString('en-IN') ?? '...'} total ads</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search title or city..."
          className="w-64 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
              <div className="h-16 w-16 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
                <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))
        ) : ads.map((ad: any) => {
          const cover = ad.images?.[0];
          return (
            <div key={ad.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {cover ? <img src={cover.url} alt={ad.title} className="h-full w-full object-cover" /> : (
                  <div className="h-full flex items-center justify-center text-gray-300">📦</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <Link to={`/product/${ad.id}`} target="_blank"
                    className="font-semibold text-gray-900 hover:underline truncate">{ad.title}
                  </Link>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[ad.status] ?? ''}`}>
                    {ad.status}
                  </span>
                  {ad.isFeatured && (
                    <span className="shrink-0 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">⭐ Featured</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                  <span style={{ color: theme.colors.brand.DEFAULT, fontWeight: 600 }}>{formatPrice(ad.price)}</span>
                  <span>📍 {ad.city}</span>
                  <span>by {ad.user?.profile?.name ?? ad.user?.email}</span>
                  <span>{formatRelativeTime(ad.createdAt)}</span>
                  <span>👥 {ad._count?.interests ?? 0} interested</span>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => feature.mutate(ad.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    ad.isFeatured ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {ad.isFeatured ? 'Unfeature' : '⭐ Feature'}
                </button>
                {ad.status !== 'REMOVED' && (
                  <button
                    onClick={() => { if (confirm('Remove this ad?')) remove.mutate(ad.id); }}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} className="mt-5" />
      )}
    </div>
  );
}
