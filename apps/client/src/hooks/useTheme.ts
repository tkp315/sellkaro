import { useEffect } from 'react';
import { theme } from '../lib/colors';
import type { ThemeMode, ConditionKey, AdStatusKey } from '../lib/colors';
import { useUIStore } from '../store/uiStore';

export function useTheme() {
  const { themeMode, toggleTheme, setTheme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const isDark = themeMode === 'dark';

  function getConditionStyle(condition: ConditionKey) {
    return theme.colors.condition[condition];
  }

  function getAdStatusStyle(status: AdStatusKey) {
    return theme.colors.adStatus[status];
  }

  return {
    theme,
    mode: themeMode as ThemeMode,
    isDark,
    toggleTheme,
    setTheme,
    getConditionStyle,
    getAdStatusStyle,
  };
}
