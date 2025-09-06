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
    main: '#5ca7f2',
    light: '#7bb8f5',
    dark: '#4a96e8',
  },
  secondary: {
    main: '#5ca7f2',
    light: '#7bb8f5',
    dark: '#4a96e8',
  },
  neutral: {
    white: '#ffffff',
    background: '#0f1419',
    surface: '#1c252e',
    lightGray: '#2b3640',
    gray: '#8696a0',
    darkGray: '#ffffff',
    border: '#2b3640',
    black: '#ffffff',
  },
  status: {
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },
  appointment: {
    confirmed: '#4ade80',
    pending: '#fbbf24',
    cancelled: '#f87171',
    completed: '#60a5fa',
    'no-show': '#a78bfa',
  },
};

const Colors: AppColors = light;
export default Colors;

export const themes = { light, dark } as const;