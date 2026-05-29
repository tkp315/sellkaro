import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/format';

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats });

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0, icon: '👥', color: '#3b82f6' },
    { label: 'Sellers', value: data?.totalSellers ?? 0, icon: '🏪', color: '#8b5cf6' },
    { label: 'Total Ads', value: data?.totalAds ?? 0, icon: '📋', color: theme.colors.brand.DEFAULT },
    { label: 'Active Ads', value: data?.activeAds ?? 0, icon: '✅', color: '#22c55e' },
    { label: 'Pending Reports', value: data?.pendingReports ?? 0, icon: '🚩', color: '#ef4444' },
    { label: 'Total Reports', value: data?.totalReports ?? 0, icon: '📣', color: '#f59e0b' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform overview</p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            {isLoading ? (
              <div className="h-7 w-16 animate-pulse rounded-lg bg-gray-200" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{s.value.toLocaleString('en-IN')}</p>
            )}
            <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending reports */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Pending Reports</h2>
            <Link to="/admin/reports" className="text-xs font-medium hover:underline" style={{ color: theme.colors.brand.DEFAULT }}>
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}
            </div>
          ) : data?.recentReports?.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No pending reports 🎉</div>
          ) : (
            <div className="space-y-3">
              {data?.recentReports?.map((r: any) => (
                <div key={r.id} className="flex items-start gap-3 rounded-xl bg-red-50 p-3">
                  <span className="mt-0.5 text-base">🚩</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.type === 'AD' ? `Ad: ${r.ad?.title ?? 'Unknown'}` : `User: ${r.reportedUser?.profile?.name ?? r.reportedUser?.email}`}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">{r.reason}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">by {r.reportedBy?.profile?.name ?? r.reportedBy?.email} · {formatRelativeTime(r.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Users</h2>
            <Link to="/admin/users" className="text-xs font-medium hover:underline" style={{ color: theme.colors.brand.DEFAULT }}>
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recentUsers?.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-50">
                  <div
                    className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: theme.colors.brand.DEFAULT }}
                  >
                    {(u.profile?.name ?? u.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.profile?.name ?? u.email}</p>
                    <p className="text-xs text-gray-400">{u.role} · {formatRelativeTime(u.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
