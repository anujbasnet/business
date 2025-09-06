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
    main: '#3390ec',
    light: '#5aa9f8',
    dark: '#1c6fb2',
  },
  secondary: {
    main: '#2b5278',
    light: '#3c6a93',
    dark: '#1e3a5a',
  },
  neutral: {
    white: '#ffffff',
    background: '#141d26',
    surface: '#1f2a36',
    lightGray: '#2a3b47',
    gray: '#8b98a5',
    darkGray: '#c5d1dc',
    border: '#2a3b47',
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