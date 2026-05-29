import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/format';

const STATUSES = [
  { value: '', label: 'Pending' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

export default function AdminReportsPage() {
  const { theme } = useTheme();
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', status, page],
    queryFn: () => adminApi.getReports({ status, page, limit: 20 }),
  });

  const resolve = useMutation({
    mutationFn: (id: string) => adminApi.resolveReport(id, noteMap[id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reports'] }),
  });
  const dismiss = useMutation({
    mutationFn: (id: string) => adminApi.dismissReport(id, noteMap[id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const reports = data?.reports ?? [];
  const pagination = data?.pagination;

  const statusBadge: Record<string, string> = {
    PENDING: 'bg-red-50 text-red-700',
    REVIEWED: 'bg-blue-50 text-blue-700',
    RESOLVED: 'bg-green-50 text-green-700',
    DISMISSED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">{pagination?.total ?? '...'} reports</p>
      </div>

      {/* Status tabs */}
      <div className="mb-5 flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatus(s.value); setPage(1); }}
            className="rounded-xl border px-4 py-2 text-sm font-medium transition"
            style={status === s.value
              ? { backgroundColor: theme.colors.brand.DEFAULT, color: '#fff', borderColor: theme.colors.brand.DEFAULT }
              : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500">No reports here</p>
          </div>
        ) : reports.map((r: any) => (
          <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[r.status] ?? ''}`}>
                    {r.status}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{r.type}</span>
                  <span className="text-xs text-gray-400">{formatRelativeTime(r.createdAt)}</span>
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {r.type === 'AD'
                    ? <Link to={`/product/${r.ad?.id}`} target="_blank" className="hover:underline">{r.ad?.title ?? 'Unknown Ad'}</Link>
                    : `User: ${r.reportedUser?.profile?.name ?? r.reportedUser?.email}`}
                </p>
                <p className="mt-1 text-sm text-gray-600">{r.reason}</p>
                <p className="mt-1 text-xs text-gray-400">Reported by: {r.reportedBy?.profile?.name ?? r.reportedBy?.email}</p>

                {r.adminNote && (
                  <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    Admin note: {r.adminNote}
                  </p>
                )}
              </div>
            </div>

            {r.status === 'PENDING' && (
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  value={noteMap[r.id] ?? ''}
                  onChange={(e) => setNoteMap((p) => ({ ...p, [r.id]: e.target.value }))}
                  placeholder="Admin note (optional)..."
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none min-w-0"
                />
                <button
                  onClick={() => resolve.mutate(r.id)}
                  disabled={resolve.isPending}
                  className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition disabled:opacity-50"
                >
                  ✓ Resolve
                </button>
                <button
                  onClick={() => dismiss.mutate(r.id)}
                  disabled={dismiss.isPending}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 transition">
            ← Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 transition">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
