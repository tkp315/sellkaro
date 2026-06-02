import { useTheme } from '@/hooks/useTheme';

export function LoadingScreen() {
  const { theme } = useTheme();

  return (
    <div
      className="flex h-screen items-center justify-center"
      style={{ backgroundColor: theme.colors.brand.DEFAULT }}
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="text-5xl font-black tracking-tighter"
          style={{ color: theme.colors.accent.DEFAULT }}
        >
          withSell
        </span>
        <div className="h-1 w-32 rounded-full overflow-hidden bg-white/20">
          <div
            className="h-full w-1/2 rounded-full animate-pulse"
            style={{ backgroundColor: theme.colors.accent.DEFAULT }}
          />
        </div>
      </div>
    </div>
  );
}
