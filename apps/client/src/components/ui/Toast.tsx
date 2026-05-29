import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';

const ICON = { success: '✅', error: '❌', info: 'ℹ️' };

export function Toast() {
  const { toast, hideToast } = useUIStore();
  const { theme } = useTheme();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 3500);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  if (!toast) return null;

  const bgColor = {
    success: theme.colors.brand.DEFAULT,
    error: theme.colors.status.error,
    info: '#1e293b',
  }[toast.type];

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      style={{ zIndex: theme.zIndex.toast }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl border border-white/10 px-5 py-3.5 text-sm font-medium text-white shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        <span>{ICON[toast.type]}</span>
        <span>{toast.message}</span>
        <button onClick={hideToast} className="ml-2 text-white/50 hover:text-white transition text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
