export const theme = {
  colors: {
    brand: {
      DEFAULT: '#002f34',
      light: '#004850',
      dark: '#001a1e',
      50: '#e6f0f1',
      100: '#b3d1d4',
    },
    accent: {
      DEFAULT: '#ffca28',
      hover: '#f5b800',
      dark: '#e6a800',
      light: '#fff3cc',
    },
    background: {
      page: '#f8fafc',
      card: '#ffffff',
      muted: '#f1f5f9',
      subtle: '#f8fafc',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
      brand: '#002f34',
    },
    border: {
      DEFAULT: '#e2e8f0',
      light: '#f1f5f9',
      focus: '#3b82f6',
    },
    status: {
      success: '#22c55e',
      successBg: '#f0fdf4',
      successText: '#166534',
      error: '#ef4444',
      errorBg: '#fef2f2',
      errorText: '#dc2626',
      warning: '#f59e0b',
      warningBg: '#fffbeb',
      warningText: '#92400e',
      info: '#3b82f6',
      infoBg: '#eff6ff',
      infoText: '#1e40af',
    },
    condition: {
      NEW: { bg: '#dcfce7', text: '#166534', label: 'New' },
      LIKE_NEW: { bg: '#dbeafe', text: '#1e40af', label: 'Like New' },
      GOOD: { bg: '#fef9c3', text: '#854d0e', label: 'Good' },
      FAIR: { bg: '#f1f5f9', text: '#475569', label: 'Fair' },
    },
    adStatus: {
      ACTIVE: { bg: '#dcfce7', text: '#166534', label: 'Active' },
      PAUSED: { bg: '#fef9c3', text: '#854d0e', label: 'Paused' },
      SOLD: { bg: '#f1f5f9', text: '#475569', label: 'Sold' },
      PENDING: { bg: '#eff6ff', text: '#1e40af', label: 'Pending' },
      REJECTED: { bg: '#fef2f2', text: '#dc2626', label: 'Rejected' },
    },
  },

  fonts: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  },

  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
  },

  transitions: {
    fast: '150ms ease',
    DEFAULT: '200ms ease',
    slow: '300ms ease',
  },

  zIndex: {
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    toast: 50,
  },
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';
export type ConditionKey = keyof typeof theme.colors.condition;
export type AdStatusKey = keyof typeof theme.colors.adStatus;
