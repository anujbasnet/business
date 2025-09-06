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
    pending: '#dd6b20',
    cancelled: '#e53e3e',
    completed: '#3182ce',
    'no-show': '#9f7aea',
  },
};

export const dark: AppColors = {
  primary: {
    main: '#1e3a8a',
    light: '#3b82f6',
    dark: '#1e40af',
  },
  secondary: {
    main: '#374151',
    light: '#6b7280',
    dark: '#1f2937',
  },
  neutral: {
    white: '#ffffff',
    background: '#111827',
    lightGray: '#374151',
    gray: '#6b7280',
    darkGray: '#d1d5db',
    black: '#000000',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  appointment: {
    confirmed: '#10b981',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    completed: '#3b82f6',
    'no-show': '#8b5cf6',
  },
};

const Colors: AppColors = light;
export default Colors;

export const themes = { light, dark } as const;