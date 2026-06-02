import { useEffect, useMemo, useState } from 'react';

/**
 * Client-side pagination for bounded lists (a user's own ads, saved items, etc.).
 * Slices the full array into pages and exposes the current page's items + controls.
 */
export function usePagination<T>(items: T[], pageSize = 12) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // If the list shrinks (e.g. after deleting) and current page is now out of range, snap back.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { page, setPage, goToPage, totalPages, pageItems };
}
