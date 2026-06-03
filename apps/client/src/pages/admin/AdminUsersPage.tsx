import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/format';
import Pagination from '@/components/ui/Pagination';

const ROLES = ['', 'BUYER', 'SELLER', 'ADMIN', 'MODERATOR'];

export default function AdminUsersPage() {
  const { theme } = useTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminApi.getUsers({ search, role, page, limit: 20 }),
  });

  const ban = useMutation({ mutationFn: (id: string) => adminApi.banUser(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
  const unban = useMutation({ mutationFn: (id: string) => adminApi.unbanUser(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
  const changeRole = useMutation({ mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.changeRole(id, role), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const roleBadge: Record<string, string> = {
    BUYER: 'bg-blue-50 text-blue-700',
    SELLER: 'bg-purple-50 text-purple-700',
    ADMIN: 'bg-red-50 text-red-700',
    MODERATOR: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">{pagination?.total?.toLocaleString('en-IN') ?? '...'} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-64 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
        >
          {ROLES.map((r) => <option key={r} value={r}>{r || 'All roles'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
              <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-semibold text-gray-600">Ads</th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-semibold text-gray-600">Joined</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-gray-100" /></td>
                  ))}
                </tr>
              ))
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: theme.colors.brand.DEFAULT }}>
                      {(u.profile?.name ?? u.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{u.profile?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      if (window.confirm(`Change ${u.email}'s role to ${newRole}?`)) {
                        changeRole.mutate({ id: u.id, role: newRole });
                      }
                    }}
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold border-0 cursor-pointer ${roleBadge[u.role] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {ROLES.filter(Boolean).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="hidden lg:table-cell px-4 py-3">
                  {u.phone ? (
                    <a href={`tel:${u.phone}`} className="text-sm text-gray-700 hover:underline">
                      {u.phone}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-gray-600">{u._count?.ads ?? 0}</td>
                <td className="hidden md:table-cell px-4 py-3 text-gray-400 text-xs">{formatRelativeTime(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.isBanned ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Banned</span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.isBanned ? (
                    <button onClick={() => unban.mutate(u.id)}
                      className="rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition">
                      Unban
                    </button>
                  ) : (
                    <button onClick={() => { if (confirm(`Ban ${u.email}?`)) ban.mutate(u.id); }}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition">
                      Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} className="mt-5" />
      )}
    </div>
  );
}
