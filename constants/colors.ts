export type AppColors = {
  primary: { main: string; light: string; dark: string };
  secondary: { main: string; light: string; dark: string };
  neutral: {
    white: string;
    background: string;
    surface: string;
    lightGray: string;
    gray: string;
    darkGray: string;
    border: string;
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
    surface: '#ffffff',
    lightGray: '#e2e8f0',
    gray: '#a0aec0',
    darkGray: '#4a5568',
    border: '#e2e8f0',
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
    main: '#1e3a8a',
    light: '#3b82f6',
    dark: '#1e40af',
  },
  neutral: {
    white: '#ffffff',
    background: '#0f172a',
    surface: '#1e293b',
    lightGray: '#334155',
    gray: '#94a3b8',
    darkGray: '#f1f5f9',
    border: '#334155',
    black: '#f8fafc',
  },
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  appointment: {
    confirmed: '#22c55e',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    completed: '#3b82f6',
    'no-show': '#8b5cf6',
  },
};

const Colors: AppColors = light;
export default Colors;

export const themes = { light, dark } as const;