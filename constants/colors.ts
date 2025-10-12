export type AppColors = {
  primary: { main: string; light: string; dark: string };
  secondary: { main: string; light: string; dark: string };
  neutral: {
    white: string;
    background: string;
    lightGray: string;
    gray: string;
    darkGray: string;
    black: string;
  };
  status: { success: string; warning: string; error: string; info: string };
  appointment: {
    confirmed: string;
    pending: string;
    cancelled: string;
    completed: string;
    'no-show': string;
  };
};

export const light: AppColors = {
  primary: {
    main: '#1a365d',
    light: '#2a4a7f',
    dark: '#102a4c',
  },
  secondary: {
    main: '#2c7a7b',
    light: '#38a169',
    dark: '#276749',
  },
  neutral: {
    white: '#ffffff',
    background: '#f7fafc',
    lightGray: '#e2e8f0',
    gray: '#a0aec0',
    darkGray: '#4a5568',
    black: '#1a202c',
  },
  status: {
    success: '#38a169',
    warning: '#dd6b20',
    error: '#e53e3e',
    info: '#3182ce',
  },
  appointment: {
    confirmed: '#38a169',
    pending: '#fbbf24',
    cancelled: '#e53e3e',
    completed: '#3182ce',
    'no-show': '#9f7aea',
  },
};

export const dark: AppColors = {
  primary: {
    main: '#0f274a',
    light: '#1d3b68',
    dark: '#0b1d37',
  },
  secondary: {
    main: '#1f4f50',
    light: '#2f6b6c',
    dark: '#163a3b',
  },
  neutral: {
    white: '#ffffff',
    background: '#0b1220',
    lightGray: '#1c2433',
    gray: '#6b7280',
    darkGray: '#cbd5e1',
    black: '#000000',
  },
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#60a5fa',
  },
  appointment: {
    confirmed: '#22c55e',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    completed: '#60a5fa',
    'no-show': '#a78bfa',
  },
};

const Colors: AppColors = light;
export default Colors;

export const themes = { light, dark } as const;