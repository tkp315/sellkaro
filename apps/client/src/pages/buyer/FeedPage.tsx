import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFeed } from '@/modules/buyer/feed/hooks/useFeed';
import { useCategories } from '@/modules/shared/categories/hooks/useCategories';
import { useTheme } from '@/hooks/useTheme';
import { useCurrentCity } from '@/hooks/useCurrentCity';
import AdCard from '@/modules/buyer/feed/components/AdCard';
import type { FeedFilters } from '@/modules/buyer/feed/types';
import type { ConditionKey } from '@/lib/colors';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
] as const;

const CONDITIONS: { value: ConditionKey | ''; label: string }[] = [
  { value: '', label: 'Any' },
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') ?? undefined;
  const urlCity   = searchParams.get('city')   ?? undefined;

  const [filters, setFilters] = useState<FeedFilters>({ search: urlSearch, city: urlCity });
  const { data, isLoading, isError } = useFeed(filters);
  const { data: categories = [] } = useCategories();
  const { theme, getConditionStyle } = useTheme();

  useEffect(() => {
    setFilters((p) => ({ ...p, search: urlSearch, page: 1 }));
  }, [urlSearch]);

  useEffect(() => {
    setFilters((p) => ({ ...p, city: urlCity, page: 1 }));
    setCityInput(urlCity ?? '');
  }, [urlCity]);

  const set = <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) =>
    setFilters((p) => ({ ...p, [key]: value || undefined, page: 1 }));

  const activeCondition = (filters.condition as ConditionKey | undefined) ?? '';

  const geo = useCurrentCity();
  const [cityInput, setCityInput] = useState(urlCity ?? '');

  useEffect(() => {
    if (geo.city) {
      setCityInput(geo.city);
      setSearchParams((p) => { p.set('city', geo.city!); return p; }, { replace: true });
    }
  }, [geo.city]);

  const applyCity = (val: string) => {
    setCityInput(val);
    setSearchParams(
      (p) => { val.trim() ? p.set('city', val.trim()) : p.delete('city'); return p; },
      { replace: true },
    );
  };

  const clearCity = () => {
    setCityInput('');
    geo.clear();
    setSearchParams((p) => { p.delete('city'); return p; }, { replace: true });
  };

  return (
    <div>
      {/* Category chips */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => set('categoryId', undefined)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                !filters.categoryId ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={!filters.categoryId ? { backgroundColor: theme.colors.brand.DEFAULT } : undefined}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => set('categoryId', c.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filters.categoryId === c.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={filters.categoryId === c.id ? { backgroundColor: theme.colors.brand.DEFAULT } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Filter bar */}
        <div className="mb-5 flex flex-wrap items-center gap-4">
          {/* Search tag */}
          {filters.search && (
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: theme.colors.brand.DEFAULT + '15',
                color: theme.colors.brand.DEFAULT,
              }}
            >
              Results for "{filters.search}"
              <button onClick={() => set('search', undefined)} className="ml-1 opacity-60 hover:opacity-100 transition">×</button>
            </div>
          )}

          {/* Location filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-gray-400">Location</label>
            <div className="flex items-center gap-1">
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => applyCity(e.target.value)}
                  placeholder="City..."
                  className="w-36 rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm focus:outline-none"
                  style={filters.city ? { borderColor: theme.colors.brand.DEFAULT + '60' } : undefined}
                />
              </div>

              {/* GPS detect button */}
              <button
                onClick={geo.detect}
                disabled={geo.isLoading}
                title="Use my current location"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700 disabled:opacity-50"
                style={geo.city ? { borderColor: theme.colors.brand.DEFAULT + '60', color: theme.colors.brand.DEFAULT } : undefined}
              >
                {geo.isLoading ? (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="3" />
                    <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    <path strokeLinecap="round" d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="currentColor" stroke="none" />
                  </svg>
                )}
              </button>

              {/* Clear */}
              {(cityInput || filters.city) && (
                <button
                  onClick={clearCity}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition"
                  title="Clear location"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {geo.error && <p className="mt-0.5 text-[11px] text-red-500">{geo.error}</p>}
          </div>

          {/* Subcategory select */}
          {filters.categoryId && categories.find((c) => c.id === filters.categoryId) && (
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-400">Subcategory</label>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
                style={{ '--tw-ring-color': theme.colors.brand.DEFAULT } as React.CSSProperties}
                onChange={(e) => set('subcategoryId', e.target.value || undefined)}
              >
                <option value="">All</option>
                {categories.find((c) => c.id === filters.categoryId)?.subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Condition pills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Condition</label>
            <div className="flex items-center gap-1.5">
              {CONDITIONS.map(({ value, label }) => {
                const isActive = activeCondition === value;
                const condStyle = value ? getConditionStyle(value as ConditionKey) : null;

                if (isActive && condStyle) {
                  return (
                    <button
                      key={value}
                      onClick={() => set('condition', undefined)}
                      className="rounded-full px-3 py-1 text-xs font-semibold border transition"
                      style={{
                        backgroundColor: condStyle.bg,
                        color: condStyle.text,
                        borderColor: condStyle.text + '44',
                      }}
                    >
                      {label} ×
                    </button>
                  );
                }

                if (isActive && !condStyle) {
                  return (
                    <button
                      key={value}
                      onClick={() => set('condition', undefined)}
                      className="rounded-full px-3 py-1 text-xs font-semibold border transition text-white"
                      style={{
                        backgroundColor: theme.colors.brand.DEFAULT,
                        borderColor: theme.colors.brand.DEFAULT,
                      }}
                    >
                      {label} ×
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    onClick={() => set('condition', value as FeedFilters['condition'] || undefined)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    {value && condStyle && (
                      <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: condStyle.text }}
                      />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price range */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-400">Min ₹</label>
              <input
                type="text"
                placeholder="0"
                className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
                onChange={(e) => set('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <span className="pb-2 text-gray-300">—</span>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-400">Max ₹</label>
              <input
                type="text"
                placeholder="Any"
                className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
                onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="ml-auto flex flex-col gap-0.5">
            <label className="text-xs text-gray-400">Sort by</label>
            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
              onChange={(e) => set('sortBy', (e.target.value as FeedFilters['sortBy']) || undefined)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {data && (
          <p className="mb-4 text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{data.pagination.total}</span> ads found
          </p>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded-full" />
                  <div className="h-3 w-full bg-gray-100 rounded-full" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-4xl mb-3">⚠️</p>
            <p className="text-gray-500">Failed to load ads. Please try again.</p>
          </div>
        )}

        {data && data.ads.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-5xl mb-4">📭</p>
            <h3 className="text-lg font-semibold text-gray-800">No ads found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search term.</p>
          </div>
        )}

        {data && data.ads.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.ads.map((ad) => <AdCard key={ad.id} ad={ad} />)}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  disabled={!filters.page || filters.page <= 1}
                  onClick={() => set('page', (filters.page ?? 1) - 1)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold">{filters.page ?? 1}</span> of{' '}
                  <span className="font-semibold">{data.pagination.totalPages}</span>
                </span>
                <button
                  disabled={!data.pagination.hasNext}
                  onClick={() => set('page', (filters.page ?? 1) + 1)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
