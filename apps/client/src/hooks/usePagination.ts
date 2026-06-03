import { useEffect, useMemo, useState } from 'react';

/**
 * Client-side pagination for bounded lists (a user's own ads, saved items, etc.).
 * Slices the full array into pages and exposes the current page's items + controls.
 */
export function usePagination<T>(items: T[], pageSize = 12) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Snap page state when the list shrinks (async correction for the next render cycle)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Clamp synchronously in the memo so we never render an empty slice in the
  // frame BEFORE the above effect fires (avoids the one-frame empty-page flash).
  const clampedPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((clampedPage - 1) * pageSize, clampedPage * pageSize),
    [items, clampedPage, pageSize],
  );

  const goToPage = (next: number) => {
    const clamped = Math.max(1, Math.min(next, totalPages));
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { page: clampedPage, setPage, goToPage, totalPages, pageItems };
}
